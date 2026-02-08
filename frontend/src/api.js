const API_URL = import.meta.env.VITE_API_URL || '';

let token = localStorage.getItem('pm_token') || '';

export function setToken(next) {
  token = next || '';
  if (token) localStorage.setItem('pm_token', token);
  else localStorage.removeItem('pm_token');
}

export function getToken() {
  return token;
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let payload;
    try { payload = await res.json(); } catch { payload = null; }
    const message = payload?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}
