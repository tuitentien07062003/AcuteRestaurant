import axiosClient from "./axiosClient";

export function checkRefundOrder(orderId) {
  return axiosClient.get(`/refund/${orderId}`).then(r => r.data);
}

export function submitRefund(orderId, reason) {
  return axiosClient.post(`/refund/${orderId}`, { reason }).then(r => r.data);
}
