import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getAccessToken() {
  return Cookies.get('access_token');
}
export function getRefreshToken() {
  return Cookies.get('refresh_token');
}
export function saveTokens(accessToken: string, refreshToken: string) {
  Cookies.set('access_token', accessToken, { expires: 1/96 }); // 15 minutos
  Cookies.set('refresh_token', refreshToken, { expires: 7 }); // 7 días
}
export function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}


// --- Refresh automático ---
async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return false;
    }

    const data = await res.json();
    saveTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// --- Cliente principal ---
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Token expirado → intentar refresh y reintentar
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch<T>(endpoint, options);
    // Si el refresh falla, redirigir a login
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'API error');
  }

  return res.json();
}