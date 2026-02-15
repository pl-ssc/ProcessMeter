import React, { useEffect, useState } from 'react';
import { apiFetch, getToken, setToken } from './api.js';
import LoginPage from './components/LoginPage.jsx';
import RespondentView from './components/RespondentView.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const boot = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await apiFetch('/api/auth/me');
        setUser(me.user);
      } catch {
        setToken('');
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
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
  };

  if (loading) {
    return <div className="page">Загрузка...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  return <RespondentView user={user} onLogout={handleLogout} />;
}
