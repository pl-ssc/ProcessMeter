import React, { useCallback, useMemo, useState } from 'react';
import { DataEditor, GridCellKind } from '@glideapps/glide-data-grid';
import { DropdownCell } from '@glideapps/glide-data-grid-cells';
import { ChevronRight } from 'lucide-react';
import "@glideapps/glide-data-grid/dist/index.css";

const defaultColumns = [
    { id: 'f4_name', title: 'Операция', width: 400, icon: 'info' },
    { id: 'labor_hours', title: 'Трудозатраты', width: 180, icon: 'info' },
    { id: 'system_id', title: 'ИТ-система', width: 220, icon: 'info' },
    { id: 'note', title: '', width: 60, icon: 'info' },
];

export default function AnswerGrid({ answers, systems, onEdit, dirtyMap, isDark, isSubmitted, selectedProcess }) {
    const [columns, setColumns] = useState(defaultColumns);
    const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
    const HEADER_ICON_SIZE = 18;
    const HEADER_ICON_PAD = 8;

    const headerTooltips = useMemo(() => ({
        f4_name: 'Название операции, которую вы выполняете.',
        labor_hours: 'Примерные трудозатраты по операции в месяц в человеко-часах.',
        system_id: 'ИТ-система, которая используется для выполнения операции.',
        note: 'Примечание к операции.',
    }), []);

    const headerIcons = useMemo(() => ({
        info: ({ fgColor }) => (
            `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">` +
            `<circle cx="10" cy="10" r="8" stroke="${fgColor}" stroke-width="1.8"/>` +
            `<line x1="10" y1="9" x2="10" y2="14" stroke="${fgColor}" stroke-width="1.8" stroke-linecap="round"/>` +
            `<circle cx="10" cy="6.5" r="1.2" fill="${fgColor}"/>` +
            `</svg>`
        ),
    }), []);

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
                return { kind: GridCellKind.Text, data: item.f4_name || '', displayData: item.f4_name || '', themeOverride, readonly: true, allowWrapping: true };
            case 1:
                return {
                    kind: GridCellKind.Number,
                    data: item.labor_hours === null || item.labor_hours === undefined ? null : Number(item.labor_hours),
                    displayData: item.labor_hours === null || item.labor_hours === undefined ? '' : String(item.labor_hours),
                    themeOverride,
                    allowOverlay: !isSubmitted,
                    readonly: isSubmitted,
                };
            case 2: {
                const name = item.system_id ? systemsById.get(item.system_id) || '' : '';
                return {
                    kind: GridCellKind.Custom,
                    allowOverlay: !isSubmitted,
                    copyData: name,
                    data: {
                        kind: "dropdown-cell",
                        allowedValues: systemOptions,
                        value: name,
                    },
                    themeOverride,
                    readonly: isSubmitted,
                };
            }
            case 3: {
                const hasNote = !!(item.note && item.note.trim() !== '');
                const noteColor = isDark ? '#38bdf8' : '#0ea5e9';
                return {
                    kind: GridCellKind.Text,
                    data: item.note || '',
                    displayData: hasNote ? '📝' : '➕',
                    themeOverride: hasNote ? { ...themeOverride, textDark: noteColor, textMedium: noteColor } : themeOverride,
                    readonly: true,
                    allowOverlay: false,
                    contentAlign: 'center'
                };
            }
            default:
                return { kind: GridCellKind.Text, data: '', displayData: '', readonly: true };
        }
    }, [answers, systemsById, systemOptions, dirtyMap, isDark, isSubmitted]);

    const [editingNote, setEditingNote] = useState(null);

    const onCellClicked = useCallback((gridCell) => {
        const [col, row] = gridCell;
        if (col === 3 && !isSubmitted) {
            const item = answers[row];
            if (item) {
                setEditingNote({ rowIndex: row, text: item.note || '' });
            }
        }
    }, [answers, isSubmitted]);

    const onSaveNote = () => {
        if (!editingNote) return;
        const item = answers[editingNote.rowIndex];
        if (item) {
            onEdit({ ...item, note: editingNote.text });
        }
        setEditingNote(null);
    };

    const onCellEdited = React.useCallback((cell, newValue) => {
        if (isSubmitted) return;
        const [col, row] = cell;
        const item = answers[row];
        if (!item) return;

        if (![1, 2].includes(col)) return;

        const next = { ...item };

        if (col === 1 && newValue.kind === GridCellKind.Number) {
            let val = null;
            if (newValue.data !== null && newValue.data !== undefined && newValue.data !== '') {
                val = Number(newValue.data);
            }

            if (val !== null && (Number.isNaN(val) || val < 0)) {
                window.alert('Трудозатраты должны быть числом от 0');
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

        onEdit(next);
    }, [answers, systemsByName, onEdit]);

    const isOverHeaderIcon = useCallback((args) => {
        if (args.kind !== 'header') return false;
        const colIndex = args.location[0];
        const col = columns[colIndex];
        if (!col || !col.icon) return false;

        const iconX = args.bounds.x + HEADER_ICON_PAD;
        const iconY = args.bounds.y + (args.bounds.height - HEADER_ICON_SIZE) / 2;
        const withinX = args.localEventX >= iconX && args.localEventX <= iconX + HEADER_ICON_SIZE;
        const withinY = args.localEventY >= iconY && args.localEventY <= iconY + HEADER_ICON_SIZE;
        return withinX && withinY;
    }, [columns, HEADER_ICON_PAD, HEADER_ICON_SIZE]);

    const onMouseMove = useCallback((args) => {
        if (args.kind !== 'header') {
            setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            return;
        }
        if (!isOverHeaderIcon(args)) {
            setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            return;
        }
        const colIndex = args.location[0];
        const col = columns[colIndex];
        const text = col ? headerTooltips[col.id] : '';
        if (!text) return;
        setTooltip({ visible: true, text, x: args.localEventX, y: args.localEventY });
    }, [columns, headerTooltips, isOverHeaderIcon]);

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
        fgIconHeader: "#38bdf8",
        bgIconHeader: "#0f172a",
        headerIconSize: HEADER_ICON_SIZE,
        cellHorizontalPadding: HEADER_ICON_PAD,
        fontFamily: "Inter, sans-serif",
    } : {
        accentColor: "#10b981",
        accentLight: "#ecfdf5",
        textHeader: "#64748b",
        textDark: "#0f172a",
        bgHeader: "#f8fafc",
        borderColor: "#e2e8f0",
        fgIconHeader: "#0ea5e9",
        bgIconHeader: "#f8fafc",
        headerIconSize: HEADER_ICON_SIZE,
        cellHorizontalPadding: HEADER_ICON_PAD,
        fontFamily: "Inter, sans-serif",
    };

    return (
        <div className="grid-wrap" style={{ position: 'relative' }}>
            {selectedProcess && (
                <div
                    className="breadcrumbs"
                    style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-panel)',
                        flexShrink: 0
                    }}
                >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedProcess.f1_name}>
                        {selectedProcess.f1_name}
                    </span>
                    <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedProcess.f2_name}>
                        {selectedProcess.f2_name}
                    </span>
                    <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedProcess.f3_name}>
                        {selectedProcess.f3_name}
                    </span>
                </div>
            )}
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
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
                    headerIcons={headerIcons}
                    onMouseMove={onMouseMove}
                    rowHeight={48}
                    onCellClicked={onCellClicked}
                />
                {editingNote && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100
                    }} onClick={() => setEditingNote(null)}>
                        <div style={{
                            width: 'min(450px, 90vw)',
                            background: isDark ? '#1e293b' : '#ffffff',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            borderRadius: 12,
                            padding: '20px',
                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ marginBottom: 12, fontWeight: 600 }}>Примечание к операции</div>
                            <textarea
                                autoFocus
                                value={editingNote.text}
                                onChange={e => setEditingNote({ ...editingNote, text: e.target.value })}
                                style={{
                                    width: '100%',
                                    minHeight: 120,
                                    padding: '10px',
                                    borderRadius: 8,
                                    border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                                    background: isDark ? '#0f172a' : '#ffffff',
                                    color: 'inherit',
                                    fontSize: 14,
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                                placeholder="Введите примечание..."
                            />
                            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button
                                    onClick={() => setEditingNote(null)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: 6,
                                        border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                                        background: 'transparent',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        cursor: 'pointer'
                                    }}
                                >Отмена</button>
                                <button
                                    onClick={onSaveNote}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: 6,
                                        border: 'none',
                                        background: '#10b981',
                                        color: '#ffffff',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >Сохранить</button>
                            </div>
                        </div>
                    </div>
                )}
                {tooltip.visible && (
                    <div
                        style={{
                            position: 'absolute',
                            left: tooltip.x + 12,
                            top: tooltip.y + 16,
                            maxWidth: 260,
                            padding: '8px 10px',
                            background: isDark ? '#0f172a' : '#ffffff',
                            color: isDark ? '#e2e8f0' : '#0f172a',
                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                            borderRadius: 8,
                            fontSize: 12,
                            lineHeight: 1.3,
                            boxShadow: isDark
                                ? '0 8px 16px rgba(0, 0, 0, 0.4)'
                                : '0 8px 16px rgba(15, 23, 42, 0.12)',
                            pointerEvents: 'none',
                            zIndex: 5,
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}
            </div>
        </div>
    );
}
