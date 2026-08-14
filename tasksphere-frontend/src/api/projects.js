import { api } from './client';

export const getAllProjects = () => api.get('/api/projects');
export const getMyProjects = () => api.get('/api/projects/mine');
export const getProject = (id) => api.get(`/api/projects/${id}`);
export const createProject = (payload) => api.post('/api/projects', payload);
export const updateProject = (id, payload) => api.put(`/api/projects/${id}`, payload);
export const updateProjectStatus = (id, status) => api.patch(`/api/projects/${id}/status`, { status });
export const addProjectMembers = (id, memberIds) => api.post(`/api/projects/${id}/members`, { memberIds });
export const deleteProject = (id) => api.delete(`/api/projects/${id}`);
