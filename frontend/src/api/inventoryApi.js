import axiosClient from './axiosClient.js';

const inventoryApi = {
  getAll: (params = {}) => axiosClient.get('/inventory', { params }),
  getById: (id) => axiosClient.get(`/inventory/${id}`),
  create: (data) => axiosClient.post('/inventory', data),
  update: (id, data) => axiosClient.put(`/inventory/${id}`, data),
  delete: (id) => axiosClient.delete(`/inventory/${id}`)
};

export default inventoryApi;

