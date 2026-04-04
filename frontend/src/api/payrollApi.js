import axiosClient from './axiosClient.js';

const payrollApi = {
  getAll: (params = {}) => axiosClient.get('/payroll', { params }),
  getById: (id) => axiosClient.get(`/payroll/${id}`),
  create: (data) => axiosClient.post('/payroll', data),
  updateStatus: (id, status) => axiosClient.patch(`/payroll/${id}/status`, { status })
};

export default payrollApi;

