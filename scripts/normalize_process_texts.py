#!/usr/bin/env python3
import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path


SAFE_ACRONYMS = {
    "it": "IT",
    "фссп": "ФССП",
    "фсс": "ФСС",
    "пфр": "ПФР",
    "лна": "ЛНА",
    "ндфл": "НДФЛ",
    "ахо": "АХО",
    "сб": "СБ",
    "тор": "ТОР",
}

TYPO_REPLACEMENTS = [
    (r"\bзявлений\b", "заявлений"),
    (r"\bзявление\b", "заявление"),
    (r"\bзявления\b", "заявления"),
    (r"\bаттрибут", "атрибут"),
    (r"\bНаправыление\b", "Направление"),
    (r"\bсредст\b", "средств"),
    (r"\bперечисление\b", "перечисление"),
    (r"\bраннее\b", "ранее"),
]

TERM_REPLACEMENTS = [
    (r"\bсотрудников\b", "работников"),
    (r"\bсотрудники\b", "работники"),
    (r"\bсотрудником\b", "работником"),
    (r"\bсотруднику\b", "работнику"),
    (r"\bсотрудника\b", "работника"),
    (r"\bсотрудник\b", "работник"),
]

PHRASE_REPLACEMENTS = [
    (r"\bв положение о подразделении\b", "в положение о подразделении"),
    (r"\bПолучение заявлений о перечисление заработной платы\b", "Получение заявлений о перечислении заработной платы"),
    (
        r"\bПолучение заявлений справок 182-Н \(2-НДФЛ\) с предыдущих мест работы\b",
        "Получение справок 182-Н (2-НДФЛ) с предыдущих мест работы",
    ),
    (
        r"\bПолучение обходного листа при увольнении \(заявлений на удержаний из заработной платы\)\b",
        "Получение обходного листа при увольнении (заявлений на удержания из заработной платы)",
    ),
    (
        r"\bОформление сокращения численности/\s*штата\b",
        "Оформление сокращения численности/штата",
    ),
    (
        r"\bВывод/\s*ввод\b",
        "Вывод/ввод",
    ),
]

SPACE_PUNCT_REPLACEMENTS = [
    (r"[ \t]+", " "),
    (r"\s+([,.)])", r"\1"),
    (r"([(])\s+", r"\1"),
    (r"\s*/\s*", "/"),
]


def parse_args():
    parser = argparse.ArgumentParser(description="Normalize process names and emit SQL/report.")
    parser.add_argument("--input", default="tmp/process_names_before.tsv")
    parser.add_argument("--output-report", default="tmp/process_name_normalization_report.json")
    parser.add_argument("--output-sql", default="tmp/process_name_normalization.sql")
    return parser.parse_args()


def title_safe_acronyms(text: str) -> str:
    def repl(match):
        word = match.group(0)
        return SAFE_ACRONYMS.get(word.lower(), word)

    return re.sub(r"\b[А-Яа-яA-Za-z]{2,5}\b", repl, text)


def normalize_text(text: str) -> tuple[str, list[str]]:
    original = text
    changes: list[str] = []

    new_text = text.strip()
    if new_text != text:
        changes.append("trim_spaces")
    text = new_text

    for pattern, replacement in SPACE_PUNCT_REPLACEMENTS:
        new_text = re.sub(pattern, replacement, text)
        if new_text != text:
            changes.append("spacing_punctuation")
            text = new_text

    # Keep slash style with spaces around it for lexical groups such as "ввод / вывод"?
    # The current reference data uses compact slash notation more consistently.

    for pattern, replacement in TYPO_REPLACEMENTS:
        new_text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        if new_text != text:
            changes.append("typo")
            text = new_text

    for pattern, replacement in TERM_REPLACEMENTS:
        new_text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        if new_text != text:
            changes.append("term_worker")
            text = new_text

    for pattern, replacement in PHRASE_REPLACEMENTS:
        new_text = re.sub(pattern, replacement, text)
        if new_text != text:
            changes.append("phrase_cleanup")
            text = new_text

    new_text = title_safe_acronyms(text)
    if new_text != text:
        changes.append("acronym_case")
        text = new_text

    new_text = re.sub(r"\s{2,}", " ", text)
    if new_text != text:
        changes.append("collapse_spaces")
        text = new_text

    return text, sorted(set(changes))


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main():
    args = parse_args()
    rows = []
    with open(args.input, "r", encoding="utf-8") as fh:
        reader = csv.DictReader(fh, delimiter="\t")
        for row in reader:
            rows.append(row)

    report = []
    counts = Counter()
    for row in rows:
        normalized, change_types = normalize_text(row["name"])
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
                "change_types": counts,
                "output_report": str(output_report),
                "output_sql": str(output_sql),
            },
            ensure_ascii=False,
            indent=2,
            default=lambda x: dict(x),
        )
    )


if __name__ == "__main__":
    main()
