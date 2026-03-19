
import axiosClient from "./axiosClient";

export function fetchEmployees() {
  return axiosClient.get("/employee").then(r => r.data);
}

export function fetchEmployeeById(id) {
  return axiosClient.get(`/employee/${id}`).then(r => r.data);
}

export function fetchEmployeesBySearch(keyword) {
  return axiosClient.get(`/employee/search?q=${keyword}`).then(r => r.data);
}

export function createEmployee(employeeData) {
  return axiosClient.post("/employee", employeeData).then(r => r.data);
}

export function updateEmployee(id, employeeData) {
  return axiosClient.put(`/employee/${id}`, employeeData).then(r => r.data);
}

export function updateEmployeeSalary(id, salary) {
  return axiosClient.patch(`/employee/salary/${id}`, { hourly_rate: salary }).then(r => r.data);
}

export function activeEmployee(id, isActive) {
  return axiosClient.patch(`/employee/active/${id}`, { active: isActive }).then(r => r.data);
}


