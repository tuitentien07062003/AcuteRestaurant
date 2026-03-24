import express from 'express';
import { 
  getAllPayrolls, 
  getPayrollById, 
  createPayroll, 
  updatePayrollStatus, 
  deletePayroll 
} from '../controllers/payrollController.js';

const routes = express.Router();

routes.get('/', getAllPayrolls);
routes.get('/:id', getPayrollById);
routes.post('/', createPayroll);
routes.patch('/:id/status', updatePayrollStatus);
routes.delete('/:id', deletePayroll);

export default routes;

