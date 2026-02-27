import React, { useState, useEffect } from 'react';
import {
    LogOut,
    CheckCircle,
    Cloud,
    Sun,
    Moon,
    UserCircle
} from 'lucide-react';

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'ProcessMeter';

export default function Header({ user, onLogout, autoSaveStatus, onSubmit, hasChanges, isDark, onToggleTheme }) {
    return (
        <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '220px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
                    <img
                        src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                        alt="ProcessLabs"
                        style={{
                            height: '64px',
                            width: 'auto',
                            mixBlendMode: isDark ? 'lighten' : 'multiply',
                            marginLeft: '-10px' // Сдвиг влево, чтобы компенсировать внутренние поля логотипа
                        }}
                    />
                </div>
                <div style={{ height: '32px', width: '1px', background: 'var(--border)' }} />
                <div>
                    <div className="title" style={{ fontSize: '1.1rem', lineHeight: '1.2' }}>{ORG_NAME}</div>
                    <div className="subtitle" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Анализ трудоемкости операций</div>
                </div>
            </div>

            <div className="topbar-actions">
                <div className="status-indicators">
                    {autoSaveStatus === 'saving' && (
                        <div className="save-status saving">
                            <Cloud size={14} className="animate-pulse" />
                            Сохранение...
                        </div>
                    )}
                    {autoSaveStatus === 'saved' && (
                        <div className="save-status saved">
                            <CheckCircle size={14} />
                            Сохранено
                        </div>
                    )}
                </div>

                <div className="v-separator" />

                <button className="ghost icon-btn" onClick={onToggleTheme} title="Сменить тему">
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="user-info">
                    <UserCircle size={20} className="text-muted" />
                    <span>{user.full_name || user.username}</span>
                </div>

                <button className="ghost icon-btn" onClick={onLogout} title="Выйти">
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}
