import express from 'express';
import { 
  getAllPayrolls, 
  getPayrollById, 
  createPayroll, 
  updatePayrollStatus, 
  deletePayroll,
  getDailySalarySummary,
  getEmployeeDayTimesheets,
  getMonthlySalarySummary,
  sendPayrollToHQ,
  getHqPayrolls,
  approvePayroll
} from '../controllers/payrollController.js';

const routes = express.Router();

routes.get('/', getAllPayrolls);
routes.get('/daily-summary', getDailySalarySummary);
routes.get('/day-timesheets', getEmployeeDayTimesheets);
routes.get('/monthly-summary', getMonthlySalarySummary);
routes.get('/hq-list', getHqPayrolls);
routes.get('/:id', getPayrollById);
routes.post('/', createPayroll);
routes.post('/send-to-hq', sendPayrollToHQ);
routes.patch('/:id/status', updatePayrollStatus);
routes.patch('/:id/approve', approvePayroll);
routes.delete('/:id', deletePayroll);

export default routes;

