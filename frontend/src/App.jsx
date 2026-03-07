import React, { Suspense, lazy, useEffect, useState } from 'react';
import { apiFetch } from './api.js';
import AdminView from './components/AdminView.jsx';
import DemoEntryPage from './components/DemoEntryPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import RespondentView from './components/RespondentView.jsx';
import SetPasswordPage from './components/SetPasswordPage.jsx';
import { AppSkeleton } from './components/Skeleton.jsx';

const AnalyticsPage = lazy(() => import('./components/AnalyticsPage.jsx'));
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

function getPathname() {
  return window.location.pathname || '/';
}

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
  const [forgotPasswordState, setForgotPasswordState] = useState('idle');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [setPasswordToken, setSetPasswordToken] = useState(getSetPasswordToken);
  const [isDark, setIsDark] = useState(false);
  const [pathname, setPathname] = useState(getPathname);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const handlePopstate = () => setPathname(getPathname());
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

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
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setUser(response.user);
    } catch {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleForgotPassword = async (username) => {
    setForgotPasswordState('loading');
    setForgotPasswordError('');

    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      setForgotPasswordState('success');
    } catch (error) {
      setForgotPasswordState('idle');
      setForgotPasswordError(error.message || 'Не удалось отправить ссылку для сброса пароля.');
    }
  };

  const handleDemoLogin = async (role) => {
    setLoginError('');
    try {
      const response = await apiFetch('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setUser(response.user);
    } catch (error) {
      setLoginError(error.message || 'Не удалось выполнить demo-вход');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
    }
  };

  const navigate = (nextPath, { replace = false } = {}) => {
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', nextPath);
    setPathname(nextPath);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'auditor' && pathname !== '/analytics') {
      navigate('/analytics', { replace: true });
      return;
    }
    if (user.role === 'respondent' && pathname === '/analytics') {
      navigate('/', { replace: true });
    }
  }, [user, pathname]);

  if (loading) {
    return <AppSkeleton />;
  }

  if (setPasswordToken) {
    return (
      <SetPasswordPage
        token={setPasswordToken}
        onDone={() => {
          window.history.replaceState({}, '', '/');
          setSetPasswordToken(null);
        }}
      />
    );
  }

  if (!user) {
    if (DEMO_MODE && !showPasswordLogin) {
      return (
        <DemoEntryPage
          onDemoLogin={handleDemoLogin}
          onOpenPasswordLogin={() => setShowPasswordLogin(true)}
          error={loginError}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        error={loginError}
        forgotPasswordState={forgotPasswordState}
        forgotPasswordError={forgotPasswordError}
        onBackToDemo={DEMO_MODE ? () => setShowPasswordLogin(false) : null}
      />
    );
  }

  if (user.role === 'admin') {
    if (pathname === '/analytics') {
      return (
        <Suspense fallback={<AppSkeleton />}>
          <AnalyticsPage
            user={user}
            onLogout={handleLogout}
            isDark={isDark}
            onToggleTheme={() => setIsDark((value) => !value)}
            onBackToAdmin={() => navigate('/')}
          />
        </Suspense>
      );
    }

    return <AdminView user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} onOpenAnalytics={() => navigate('/analytics')} />;
  }

  if (user.role === 'auditor') {
    if (pathname !== '/analytics') return <AppSkeleton />;

    return (
      <Suspense fallback={<AppSkeleton />}>
        <AnalyticsPage user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} />
      </Suspense>
    );
  }
  if (pathname === '/analytics') return <AppSkeleton />;

  return <RespondentView user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} />;
}
