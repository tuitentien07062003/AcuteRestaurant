import express from 'express';
import { 
  getAllPayrolls, 
  getPayrollById, 
  createPayroll, 
  updatePayrollStatus, 
  deletePayroll,
  getDailySalarySummary,
  getEmployeeDayTimesheets,
  getMonthlySalarySummary
} from '../controllers/payrollController.js';

const routes = express.Router();

routes.get('/', getAllPayrolls);
routes.get('/daily-summary', getDailySalarySummary);
routes.get('/day-timesheets', getEmployeeDayTimesheets);
routes.get('/monthly-summary', getMonthlySalarySummary);
routes.get('/:id', getPayrollById);
routes.post('/', createPayroll);
routes.patch('/:id/status', updatePayrollStatus);
routes.delete('/:id', deletePayroll);

export default routes;

