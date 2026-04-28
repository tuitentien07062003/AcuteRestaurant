import axiosClient from "./axiosClient.js";

export const getHqPayrolls = (month, year, status) =>
  axiosClient.get("/hq/payrolls", { params: { month, year, status } });

export const getPayrollById = (id) =>
  axiosClient.get(`/hq/payrolls/${id}`);

export const approvePayroll = (id) =>
  axiosClient.patch(`/hq/payrolls/${id}/approve`);

