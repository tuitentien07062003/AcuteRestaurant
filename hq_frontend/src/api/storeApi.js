import axiosClient from "./axiosClient.js";

export const getStores = () => axiosClient.get("/hq/stores");

export const getStoreById = (id) => axiosClient.get(`/hq/stores/${id}`);

export const getStoreSales = (id, from, to) =>
  axiosClient.get(`/hq/stores/${id}/sales`, { params: { from, to } });

export const updateStoreSales = (id, date, data) =>
  axiosClient.patch(`/hq/stores/${id}/sales/${date}`, data);

export const getPayrollDaily = (date, storeId) =>
  axiosClient.get("/acute/payroll/daily-summary", { params: { date, store_id: storeId } });
