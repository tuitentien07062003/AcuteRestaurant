import axiosClient from "./axiosClient";

export function login(form) {
  return axiosClient.post("/auth/login", form).then(r => r.data);
}

export function logout() {
  return axiosClient.post("/auth/logout");
}

export function getUser() {
  return axiosClient.get("/auth/me").then(r => r.data);
}
