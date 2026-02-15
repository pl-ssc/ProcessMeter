import React, { useState } from 'react';

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'ProcessMeter';

export default function LoginPage({ onLogin, error }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = form.get('username');
    const password = form.get('password');
    onLogin(username, password);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>{ORG_NAME}</h1>
        <p>Вход для заполнения трудоемкости операций</p>
        <form onSubmit={handleSubmit}>
          <label>
            Логин
            <input name="username" type="text" required />
          </label>
          <label>
            Пароль
            <div className="password-input-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}

