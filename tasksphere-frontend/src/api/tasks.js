import { api } from './client';

export const getAllTasks = () => api.get('/api/tasks');
export const getTask = (id) => api.get(`/api/tasks/${id}`);
export const getTasksForProject = (projectId) => api.get(`/api/tasks/project/${projectId}`);
export const getMyTasks = () => api.get('/api/tasks/mine');
export const createTask = (payload) => api.post('/api/tasks', payload);
export const updateTask = (id, payload) => api.put(`/api/tasks/${id}`, payload);
export const updateTaskStatus = (id, status) => api.patch(`/api/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);
export const getComments = (taskId) => api.get(`/api/tasks/${taskId}/comments`);
export const addComment = (taskId, content) => api.post(`/api/tasks/${taskId}/comments`, { content });
