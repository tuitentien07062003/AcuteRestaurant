import axiosClient from './axiosClient.js';

const paymentRequestApi = {
  getAll: (params = {}) => axiosClient.get('/payment-requests', { params }),
  getById: (id) => axiosClient.get(`/payment-requests/${id}`),
  create: (data) => axiosClient.post('/payment-requests', data),
  updateStatus: (id, data) => axiosClient.patch(`/payment-requests/${id}/status`, data)
};

export default paymentRequestApi;

