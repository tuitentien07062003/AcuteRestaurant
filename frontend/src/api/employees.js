
import axiosClient from "./axiosClient";

export function fetchEmployees() {
  return axiosClient.get("/employees").then(r => r.data);
}

export function fetchEmployeeById(id) {
  return axiosClient.get(`/employees/${id}`).then(r => r.data);
}

export function fetchEmployeesBySearch(keyword) {
  return axiosClient.get(`/employees/search?q=${keyword}`).then(r => r.data);
}

export function updateEmployeeSalary(id, salary) {
  return axiosClient.patch(`/employees/salary/${id}`, { salary }).then(r => r.data);
}

export function activeEmployee(id, isActive) {
  return axiosClient.patch(`/employees/active/${id}`, { is_active: isActive }).then(r => r.data);
}


