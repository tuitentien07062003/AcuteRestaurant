import axiosClient from './axiosClient.js';

const stockApi = {
  getStockByStore: (storeId) => axiosClient.get(`/stock/${storeId}`),
  updateStock: (storeId, itemId, data) => axiosClient.put(`/stock/${storeId}/${itemId}`, data),
  bulkUpdateStock: (storeId, data) => axiosClient.put(`/stock/${storeId}/bulk`, data)
};

export default stockApi;

