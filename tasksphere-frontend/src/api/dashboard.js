import { api } from './client';

export const getDashboardSummary = () => api.get('/api/dashboard/summary');
