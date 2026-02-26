import React, { useEffect, useState } from 'react';
import { apiFetch } from './api.js';
import LoginPage from './components/LoginPage.jsx';
import RespondentView from './components/RespondentView.jsx';
import AdminView from './components/AdminView.jsx';
import SetPasswordPage from './components/SetPasswordPage.jsx';
import { AppSkeleton } from './components/Skeleton.jsx';

/** Reads ?action=set-password&token=... from the URL */
function getSetPasswordToken() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'set-password' && params.get('token')) {
    return params.get('token');
  }
  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [setPasswordToken, setSetPasswordToken] = useState(getSetPasswordToken);

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

  // ─── Show skeleton while checking session ───────────────────────────────
  if (loading) {
    return <AppSkeleton />;
  }

  // ─── Token link from invitation / reset email ────────────────────────────
  // Checked after loading to avoid showing the form to already-authenticated users
  if (setPasswordToken) {
    return (
      <SetPasswordPage
        token={setPasswordToken}
        onDone={() => {
          // Clear token from URL and go to login
          window.history.replaceState({}, '', '/');
          setSetPasswordToken(null);
        }}
      />
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  if (user.role === 'admin') {
    return <AdminView user={user} onLogout={handleLogout} />;
  }

  return <RespondentView user={user} onLogout={handleLogout} />;
}
