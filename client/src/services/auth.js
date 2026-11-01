const TOKEN_KEY = 'ai-mystery-room-token';

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const responseText = await response.text();
  let body;
  try {
    body = responseText ? JSON.parse(responseText) : null;
  } catch {
    body = null;
  }
  if (!body) {
    if (!response.ok) {
      throw new Error(`The server could not complete the request (HTTP ${response.status}).`);
    }
    throw new Error('The server returned an empty or invalid response. Check that the API server is running and connected to MongoDB.');
  }
  if (!response.ok) throw new Error(body.message || 'The request could not be completed.');
  return body.data;
}

export const authService = {
  tokenKey: TOKEN_KEY,
  getToken: () => localStorage.getItem(TOKEN_KEY),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: (token) => request('/auth/me', { token }),
};
