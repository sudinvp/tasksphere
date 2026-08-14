import { api } from './client';

export const getAllUsers = () => api.get('/api/users');
export const getUser = (id) => api.get(`/api/users/${id}`);
export const updateUserRole = (id, role) => api.put(`/api/users/${id}/role`, { role });
export const setUserEnabled = (id, enabled) => api.put(`/api/users/${id}/enabled?enabled=${enabled}`);
