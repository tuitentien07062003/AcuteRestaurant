import axiosClient from "./axiosClient";

export function fetchMenu(category) {
  return axiosClient
    .get("/menu/menu-items", { params: { category } })
    .then(r => r.data);
}
