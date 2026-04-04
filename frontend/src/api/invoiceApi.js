import axiosClient from './axiosClient.js';

const invoiceApi = {
  getAll: (params = {}) => axiosClient.get('/invoices', { params }),
  getById: (id) => axiosClient.get(`/invoices/${id}`),
  create: (data) => axiosClient.post('/invoices', data),
  updateApproval: (id, status) => axiosClient.put(`/invoices/${id}/approval`, { status })
};

export default invoiceApi;

