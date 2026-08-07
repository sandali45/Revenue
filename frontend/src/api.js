const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export function getToken() {
  return localStorage.getItem('itx_revenue_token');
}

export function saveToken(token) {
  localStorage.setItem('itx_revenue_token', token);
}

export function clearToken() {
  localStorage.removeItem('itx_revenue_token');
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || 'Request failed');
  }

  return body;
}
