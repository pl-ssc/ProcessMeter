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
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 1500);

    const boot = async () => {
      try {
        const me = await apiFetch('/api/auth/me', { signal: controller.signal });
        setUser(me.user);
      } catch {
        setUser(null);
      } finally {
        window.clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    boot();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
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

  const handleSwitchRole = async (nextRole) => {
    const currentRole = user?.active_role || user?.role;
    if (!user || nextRole === currentRole) return;

    if (currentRole === 'respondent' && nextRole !== 'respondent') {
      const shouldSwitch = window.confirm('Переключить режим? Несохранённые изменения в режиме респондента могут быть потеряны.');
      if (!shouldSwitch) return;
    }

    try {
      const response = await apiFetch('/api/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role: nextRole }),
      });
      setUser(response.user);

      if (nextRole === 'respondent') {
        navigate('/', { replace: true });
      } else {
        navigate('/analytics', { replace: true });
      }
    } catch (error) {
      setLoginError(error.message || 'Не удалось переключить режим');
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
    const activeRole = user.active_role || user.role;
    if (activeRole === 'auditor' && pathname !== '/analytics') {
      navigate('/analytics', { replace: true });
      return;
    }
    if (activeRole === 'respondent' && pathname === '/analytics') {
      navigate('/', { replace: true });
      return;
    }
    if (activeRole === 'admin' && pathname !== '/' && pathname !== '/analytics') {
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

  const activeRole = user.active_role || user.role;

  if (activeRole === 'admin') {
    if (pathname === '/analytics') {
      return (
        <Suspense fallback={<AppSkeleton />}>
          <AnalyticsPage
            user={user}
            onLogout={handleLogout}
            isDark={isDark}
            onToggleTheme={() => setIsDark((value) => !value)}
            onBackToAdmin={() => navigate('/')}
            onSwitchRole={handleSwitchRole}
          />
        </Suspense>
      );
    }

    return <AdminView user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} onOpenAnalytics={() => navigate('/analytics')} onSwitchRole={handleSwitchRole} />;
  }

  if (activeRole === 'auditor') {
    if (pathname !== '/analytics') return <AppSkeleton />;

    return (
      <Suspense fallback={<AppSkeleton />}>
        <AnalyticsPage user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} onSwitchRole={handleSwitchRole} />
      </Suspense>
    );
  }
  if (pathname === '/analytics') return <AppSkeleton />;

  return <RespondentView user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} onSwitchRole={handleSwitchRole} />;
}
