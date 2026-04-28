import axiosClient from "./axiosClient.js";

export const getEmployees = (storeId) => {
  const params = storeId ? { store_id: storeId } : {};
  return axiosClient.get("/hq/", { params });
};

export const getEmployeeById = (id) => axiosClient.get(`/hq/${id}`);

