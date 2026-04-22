import axiosClient from './axiosClient.js';

const payrollApi = {
  getAll: (params = {}) => axiosClient.get('/payroll', { params }),
  getById: (id) => axiosClient.get(`/payroll/${id}`),
  create: (data) => axiosClient.post('/payroll', data),
  updateStatus: (id, status) => axiosClient.patch(`/payroll/${id}/status`, { status }),
  
  // Lấy tóm tắt lương ngày
  getDailySalarySummary: (date, storeId) => 
    axiosClient.get('/payroll/daily-summary', { 
      params: { date, store_id: storeId } 
    }).then(r => r.data),
  
  // Lấy danh sách check-in/out nhân viên trong ngày
  getEmployeeDayTimesheets: (date, storeId, page = 1, limit = 20) => 
    axiosClient.get('/payroll/day-timesheets', { 
      params: { date, store_id: storeId, page, limit } 
    }).then(r => r.data),
  
  // Lấy tóm tắt lương tháng
  getMonthlySalarySummary: (month, year, storeId) => 
    axiosClient.get('/payroll/monthly-summary', { 
      params: { month, year, store_id: storeId } 
    }).then(r => r.data)
};

export default payrollApi;

