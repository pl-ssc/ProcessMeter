import React, { useState } from 'react';
import {
    Users,
    Settings,
    Database,
    LogOut,
    LayoutDashboard,
    ChevronLeft,
    Menu
} from 'lucide-react';
import Header from './Header.jsx';
// Эти компоненты мы создадим на следующих этапах
import UserManagement from './admin/UserManagement.jsx';
// import AccessControl from './admin/AccessControl.jsx';
import DataImport from './admin/DataImport.jsx';

export default function AdminView({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        // { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
        { id: 'users', label: 'Пользователи', icon: Users },
        // { id: 'access', label: 'Доступы', icon: Database },
        { id: 'import', label: 'Импорт данных', icon: Settings },
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

                    {activeTab === 'import' && (
                        <div className="admin-page">
                            <h1>Импорт и синхронизация</h1>
                            <DataImport />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
