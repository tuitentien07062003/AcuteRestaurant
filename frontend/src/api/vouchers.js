import axiosClient from "./axiosClient";

export function fetchVouchers() {
  return axiosClient.get("/voucher").then(r => r.data);
}

export function checkVoucherCode(code) {
  return axiosClient.get(`/voucher/code/${code}`).then(r => r.data);
}

// add more voucher related endpoints as needed
