import React, { useEffect, useState } from 'react';
import { apiFetch } from './api.js';
import LoginPage from './components/LoginPage.jsx';
import RespondentView from './components/RespondentView.jsx';
import AdminView from './components/AdminView.jsx';
import { AppSkeleton } from './components/Skeleton.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const boot = async () => {
      try {
        const me = await apiFetch('/api/auth/me');
        setUser(me.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  const handleLogin = async (username, password) => {
    setLoginError('');
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setUser(res.user);
    } catch (err) {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return <AppSkeleton />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  // Ролевая модель: если админ, по умолчанию показываем админку, 
  // но даем возможность переключиться в режим респондента (если нужно).
  // Для простоты сейчас: админы видят админку, респонденты — анкету.
  if (user.role === 'admin') {
    return <AdminView user={user} onLogout={handleLogout} />;
  }

  return <RespondentView user={user} onLogout={handleLogout} />;
}
