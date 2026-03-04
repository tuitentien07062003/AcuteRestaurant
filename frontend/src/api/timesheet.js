import axiosClient from "./axiosClient";

export function fetchTimesheets() {
  return axiosClient.get("/timesheet").then(r => r.data);
}

export function checkInOut(internal_id) {
  return axiosClient.post("/timesheet/check-in", { internal_id }).then(r => r.data);
}
