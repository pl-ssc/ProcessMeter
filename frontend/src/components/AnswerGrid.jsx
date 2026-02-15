import React, { useCallback, useMemo, useState } from 'react';
import { DataEditor, GridCellKind } from '@glideapps/glide-data-grid';
import { DropdownCell } from '@glideapps/glide-data-grid-cells';
import "@glideapps/glide-data-grid/dist/index.css";

const defaultColumns = [
    { id: 'f4_name', title: 'Операция', width: 400 },
    { id: 'labor_hours', title: 'Трудоемкость (чел-часы)', width: 180 },
    { id: 'system_id', title: 'ИТ-система', width: 220 },
    { id: 'note', title: 'Примечание', width: 320 },
];

export default function AnswerGrid({ answers, systems, onEdit, dirtyMap, isDark }) {
    const [columns, setColumns] = useState(defaultColumns);

    const onColumnResize = useCallback((column, newSize, colIndex) => {
        setColumns(prev => {
            const newCols = [...prev];
            newCols[colIndex] = { ...newCols[colIndex], width: newSize };
            return newCols;
        });
    }, []);

    const customRenderers = useMemo(() => [DropdownCell], []);

    const systemsById = React.useMemo(() => {
        const map = new Map();
        for (const s of (systems || [])) map.set(s.system_id, s.system_name);
        return map;
    }, [systems]);

    const systemsByName = React.useMemo(() => {
        const map = new Map();
        for (const s of (systems || [])) map.set(s.system_name.toLowerCase(), s.system_id);
        return map;
    }, [systems]);

    const systemOptions = React.useMemo(() => {
        const options = (systems || []).map(s => s.system_name);
        return ['', ...options]; // Allow empty
    }, [systems]);

    const getCellContent = React.useCallback((cell) => {
        const [col, row] = cell;
        const item = answers[row];
        if (!item) return { kind: GridCellKind.Text, data: '', displayData: '' };

        const isDirty = dirtyMap.has(item.operation_id);
        const hasData = (item.labor_hours !== null && item.labor_hours !== undefined) ||
            (item.system_id !== null && item.system_id !== undefined) ||
            (item.note && item.note.trim() !== '');

        // Use theme-aware accent colors for dirty or filled rows
        const dirtyColor = isDark ? '#064e3b' : '#ecfdf5';
        const themeOverride = (isDirty || hasData) ? { bgCell: dirtyColor } : undefined;

        switch (col) {
            case 0:
                return { kind: GridCellKind.Text, data: item.f4_name || '', displayData: item.f4_name || '', themeOverride, readonly: true };
            case 1:
                return {
                    kind: GridCellKind.Number,
                    data: item.labor_hours === null || item.labor_hours === undefined ? null : Number(item.labor_hours),
                    displayData: item.labor_hours === null || item.labor_hours === undefined ? '' : String(item.labor_hours),
                    themeOverride,
                    allowOverlay: true,
                    readonly: false,
                };
            case 2: {
                const name = item.system_id ? systemsById.get(item.system_id) || '' : '';
                return {
                    kind: GridCellKind.Custom,
                    allowOverlay: true,
                    copyData: name,
                    data: {
                        kind: "dropdown-cell",
                        allowedValues: systemOptions,
                        value: name,
                    },
                    themeOverride,
                    readonly: false,
                };
            }
            case 3:
                return {
                    kind: GridCellKind.Text,
                    data: item.note || '',
                    displayData: item.note || '',
                    themeOverride,
                    readonly: false,
                    allowOverlay: true
                };
            default:
                return { kind: GridCellKind.Text, data: '', displayData: '', readonly: true };
        }
    }, [answers, systemsById, systemOptions, dirtyMap, isDark]);

    const onCellEdited = React.useCallback((cell, newValue) => {
        const [col, row] = cell;
        const item = answers[row];
        if (!item) return;

        if (![1, 2, 3].includes(col)) return;

        const next = { ...item };

        if (col === 1 && newValue.kind === GridCellKind.Number) {
            const val = newValue.data === null ? null : Number(newValue.data);
            if (val !== null && (Number.isNaN(val) || val < 0 || val > 240)) {
                window.alert('Трудоемкость должна быть числом от 0 до 240');
                return;
            }
            next.labor_hours = val;
        }

        if (col === 2 && newValue.kind === GridCellKind.Custom) {
            const text = (newValue.data.value || '').trim();
            if (!text) {
                next.system_id = null;
            } else {
                const id = systemsByName.get(text.toLowerCase());
                if (!id) {
                    window.alert('ИТ-система не найдена в справочнике');
                    return;
                }
                next.system_id = id;
            }
        }

        if (col === 3 && newValue.kind === GridCellKind.Text) {
            next.note = newValue.data || '';
        }

        onEdit(next);
    }, [answers, systemsByName, onEdit]);

    if (!answers || answers.length === 0) {
        return <div className="grid-placeholder">Загрузка данных...</div>;
    }

    const gridTheme = isDark ? {
        accentColor: "#10b981",
        accentLight: "rgba(16, 185, 129, 0.1)",
        textHeader: "#94a3b8",
        textMedium: "#94a3b8",
        textDark: "#f8fafc",
        bgHeader: "#1e293b",
        borderColor: "#334155",
        bgCell: "#0f172a",
        fontFamily: "Inter, sans-serif",
    } : {
        accentColor: "#10b981",
        accentLight: "#ecfdf5",
        textHeader: "#64748b",
        textDark: "#0f172a",
        bgHeader: "#f8fafc",
        borderColor: "#e2e8f0",
        fontFamily: "Inter, sans-serif",
    };

    return (
        <div className="grid-wrap">
            <DataEditor
                columns={columns}
                getCellContent={getCellContent}
                rows={answers.length}
                width="100%"
                onCellEdited={onCellEdited}
                rowMarkers="none"
                smoothScrollX
                smoothScrollY
                height="100%"
                stickyColumns={1}
                customRenderers={customRenderers}
                theme={gridTheme}
                onColumnResize={onColumnResize}
            />
        </div>
    );
}
