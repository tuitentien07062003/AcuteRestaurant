import axiosClient from "./axiosClient";

export function fetchMenuCategories() {
  return axiosClient.get("/menu-categories").then(r => r.data);
}
