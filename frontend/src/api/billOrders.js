import axiosClient from "./axiosClient";

export function fetchBillOrders() {
  return axiosClient.get("/bill-orders").then(r => r.data);
}

export function fetchBillDetail(id) {
  return axiosClient.get(`/bill-orders/${id}`).then(r => r.data);
}

export function updateOrderStatus(id, status) {
  return axiosClient.patch(`/bill-orders/${id}/status`, { status }).then(r => r.data);
}

export function completeOrder(id) {
  return axiosClient.patch(`/bill-orders/${id}/complete`).then(r => r.data);
}

export function createBillOrder(orderData) {
  return axiosClient.post("/bill-orders", orderData).then(r => r.data);
}
