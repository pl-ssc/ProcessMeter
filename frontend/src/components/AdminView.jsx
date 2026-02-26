import React, { useState } from 'react';
import {
    Users,
    Settings,
    Database,
    LogOut,
    LayoutDashboard,
    ChevronLeft,
    Menu,
    BookOpen
} from 'lucide-react';
import Header from './Header.jsx';
import UserManagement from './admin/UserManagement.jsx';
import DataImport from './admin/DataImport.jsx';
import SmtpSettings from './admin/SmtpSettings.jsx';
import Dictionaries from './admin/Dictionaries.jsx';

export default function AdminView({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { id: 'users', label: 'Пользователи', icon: Users },
        { id: 'dictionaries', label: 'Справочники', icon: BookOpen },
        { id: 'import', label: 'Импорт данных', icon: Database },
        { id: 'settings', label: 'Настройки', icon: Settings },
    ];

    return (
        <div className="app admin-panel">
            <Header
                user={user}
                onLogout={onLogout}
                // В админке некоторые функции хедера могут быть неактивны
                onSubmit={() => { }}
                hasChanges={false}
                isDark={false} // Пока без темной темы для админки
                onToggleTheme={() => { }}
            />

            <div className="admin-layout">
                <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <span className="sidebar-title">Управление</span>
                        <button className="ghost icon-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon size={20} />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </button>
                        ))}
                        <a
                            href="https://plnsi.processlabs.ru/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-item"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <Database size={20} />
                            {isSidebarOpen && <span>NocoDB (Эталоны)</span>}
                        </a>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="nav-item logout" onClick={onLogout}>
                            <LogOut size={20} />
                            {isSidebarOpen && <span>Выйти</span>}
                        </button>
                    </div>
                </aside>

                <main className="admin-content">
                    {/* Заглушки для будущего функционала */}
                    {activeTab === 'users' && (
                        <div className="admin-page">
                            <h1>Управление пользователями</h1>
                            <UserManagement />
                        </div>
                    )}

                    {activeTab === 'dictionaries' && (
                        <div className="admin-page">
                            <h1>Справочники</h1>
                            <Dictionaries />
                        </div>
                    )}

                    {activeTab === 'import' && (
                        <div className="admin-page">
                            <h1>Импорт и синхронизация</h1>
                            <DataImport />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="admin-page">
                            <h1>Настройки приложения</h1>
                            <SmtpSettings />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
