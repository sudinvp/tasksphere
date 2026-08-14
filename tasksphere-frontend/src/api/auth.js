import { api, setToken } from './client';

export async function register({ fullName, email, password }) {
  const data = await api.post('/api/auth/register', { fullName, email, password });
  setToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const data = await api.post('/api/auth/login', { email, password });
  setToken(data.token);
  return data;
}

export function logout() {
  setToken(null);
}
