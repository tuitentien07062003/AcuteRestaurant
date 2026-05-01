import axiosClient from "./axiosClient.js";

/**
 * Lấy dự báo doanh thu cho Admin dashboard
 * @param {number} storeId
 * @param {number} days
 */
export const getForecast = (storeId, days = 7) =>
  axiosClient.get("/sales/forecast", { params: { store_id: storeId, days } });

