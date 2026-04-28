import express from 'express';
import {
    getAllStores,
    getStoreById,
    getStoreSalesSummary,
    updateStoreSalesSummary
} from '../controllers/storeController.js';
import { validateEmployee, validateEmployeeUpdate } from '../middlewares/employeeValidate.js';
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    activeEmployee,
    getEmployeeBySeacrh,
    salaryEmployee,
    deleteEmployee
} from '../controllers/employeeController.js';
import {
    getHqPayrolls,
    getPayrollById,
    approvePayroll
} from '../controllers/payrollController.js';

const routes = express.Router();

// Store routes for HQ
routes.get('/stores', getAllStores);
routes.get('/stores/:id', getStoreById);
routes.get('/stores/:id/sales', getStoreSalesSummary);
routes.patch('/stores/:id/sales/:date', updateStoreSalesSummary);

// Payroll routes for HQ (no auth required) - MUST be before /:id to avoid matching "payrolls" as employee id
routes.get('/payrolls', getHqPayrolls);
routes.get('/payrolls/:id', getPayrollById);
routes.patch('/payrolls/:id/approve', approvePayroll);

// Employee routes
routes.get('/', getAllEmployees);
routes.get('/search', getEmployeeBySeacrh);
routes.get('/:id', getEmployeeById);
routes.post('/', validateEmployee, createEmployee);
routes.put('/:id', validateEmployeeUpdate, updateEmployee);
routes.patch('/active/:id', activeEmployee);
routes.patch('/salary/:id', salaryEmployee);
routes.delete('/:id', deleteEmployee);

export default routes;
