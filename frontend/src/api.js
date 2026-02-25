const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });
  if (!res.ok) {
    let payload;
    try { payload = await res.json(); } catch { payload = null; }
    const message = payload?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}
