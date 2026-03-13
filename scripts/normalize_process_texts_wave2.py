#!/usr/bin/env python3
import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path


EXACT_REPLACEMENTS = {
    "Написание и обновление Формирование и актуализация методологических документов по бухгалтерскому и налоговому учету":
        "Формирование и актуализация методологических документов по бухгалтерскому и налоговому учету",
    "Подписание приказа, ознакомление работника":
        "Подписание приказа и ознакомление с ним работника",
    "Подписание приказа, ознакомление работника с приказом":
        "Подписание приказа и ознакомление с ним работника",
    "Отправка листов нетрудоспособности в ФСС, и формирование заявок на выплату средств за счет средств предприятия":
        "Отправка листов нетрудоспособности в ФСС и формирование заявок на выплату средств за счет средств предприятия",
    "Получение заявлений о перечислении заработной платы на счет в банке":
        "Получение заявлений о перечислении заработной платы на банковский счет",
    "Уведомление бывшего работодателя о приеме работников, состоящих ранее на государственной муниципальной службе":
        "Уведомление бывшего работодателя о приеме работников, ранее состоявших на государственной или муниципальной службе",
    "Определение налоговой базы и расчетов с участниками КГН":
        "Определение налоговой базы и расчетов по операциям с участниками КГН",
    "Прочее по участку расходов и расчетов с кредиторами":
        "Прочие операции по участку расходов и расчетов с кредиторами",
    "Прочее по участку доходов и расчетов с дебиторами":
        "Прочие операции по участку доходов и расчетов с дебиторами",
    "Прочее по участку автоматизация бухгалтерского и налогового учета":
        "Прочие операции по участку автоматизации бухгалтерского и налогового учета",
    "Прочее по участку затраты и формирование себестоимости продукции (работ, услуг)":
        "Прочие операции по участку затрат и формирования себестоимости продукции (работ, услуг)",
    "Прочее по участку затраты при осуществлении торговой деятельности":
        "Прочие операции по участку затрат при осуществлении торговой деятельности",
    "Прочее по участку расчеты с персоналом":
        "Прочие операции по участку расчетов с персоналом",
    "Прочее по участку учет финансовых вложений, кредитов и займов":
        "Прочие операции по участку учета финансовых вложений, кредитов и займов",
    "Прочее по участку Учет КВ, ОС и НМА":
        "Прочие операции по участку учета КВ, ОС и НМА",
    "Прочее по участку Запасы":
        "Прочие операции по участку запасов",
    "Прочее по участку закрытие периода и формирование отчетности":
        "Прочие операции по участку закрытия периода и формирования отчетности",
    "Прочее по участку затраты обслуживающих производств и хозяйств":
        "Прочие операции по участку затрат обслуживающих производств и хозяйств",
    "Прочее по участку налоговый учет":
        "Прочие операции по участку налогового учета",
    "Прочее по участку расчеты с подотчетными лицами":
        "Прочие операции по участку расчетов с подотчетными лицами",
}

REGEX_REPLACEMENTS = [
    (
        r"^Формирование управленческих отчетов/форм по участку налоговый учет\b",
        "Формирование управленческих отчетов/форм по участку налогового учета",
        "style_tax_area",
    ),
    (
        r"\bВнесение данных доплатах и надбавках\b",
        "Внесение данных о доплатах и надбавках",
        "grammar",
    ),
    (
        r"\bв случае выявления излишек/недостач/пересортицы\b",
        "в случае выявления излишков/недостач/пересортицы",
        "grammar",
    ),
    (
        r"\bза 2 и 3 месяц\b",
        "за 2-й и 3-й месяц",
        "grammar",
    ),
]


def parse_args():
    parser = argparse.ArgumentParser(description="Apply curated wording normalization to process names.")
    parser.add_argument("--input", default="tmp/process_names_after.tsv")
    parser.add_argument("--output-report", default="tmp/process_name_normalization_wave2_report.json")
    parser.add_argument("--output-sql", default="tmp/process_name_normalization_wave2.sql")
    return parser.parse_args()


def apply_replacements(text: str):
    changes = []
    current = text

    if current in EXACT_REPLACEMENTS:
        current = EXACT_REPLACEMENTS[current]
        changes.append("exact_style")

    for pattern, replacement, change_type in REGEX_REPLACEMENTS:
        new_text = re.sub(pattern, replacement, current)
        if new_text != current:
            current = new_text
            changes.append(change_type)

    return current, sorted(set(changes))


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main():
    args = parse_args()
    rows = list(csv.DictReader(open(args.input, encoding="utf-8"), delimiter="\t"))

    report = []
    counts = Counter()
    for row in rows:
        normalized, change_types = apply_replacements(row["name"])
        if normalized != row["name"]:
            item = {
                "level": row["level"],
                "id": int(row["id"]),
                "parent_id": int(row["parent_id"]) if row["parent_id"] else None,
                "original_text": row["name"],
                "normalized_text": normalized,
                "change_types": change_types,
                "confidence": "high",
            }
            report.append(item)
            counts.update(change_types)

    output_report = Path(args.output_report)
    output_sql = Path(args.output_sql)
    output_report.parent.mkdir(parents=True, exist_ok=True)
    output_sql.parent.mkdir(parents=True, exist_ok=True)
    output_report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    field_by_level = {
        "process_1": "f1_name",
        "process_2": "f2_name",
        "process_3": "f3_name",
        "process_4": "f4_name",
    }
    lines = ["BEGIN;"]
    for item in report:
        field = field_by_level[item["level"]]
        lines.append(
            f"UPDATE {item['level']} SET {field} = {sql_quote(item['normalized_text'])} WHERE id = {item['id']};"
        )
    lines.append("COMMIT;")
    output_sql.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "changes": len(report),
                "change_types": dict(counts),
                "output_report": str(output_report),
                "output_sql": str(output_sql),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
