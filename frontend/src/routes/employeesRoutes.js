import express from 'express';
import { validateEmployee, validateEmployeeUpdate } from '../middlewares/employeeValidate.js';
import { 
    getAllEmployees, 
    getEmployeeById,
    createEmployee, 
    updateEmployee, 
    activeEmployee,
    getEmployeeBySeacrh,
    salaryEmployee
} from '../controllers/employeeController.js';

const routes = express.Router();

routes.get('/', getAllEmployees);
routes.get('/search', getEmployeeBySeacrh);
routes.get('/:id', getEmployeeById);
routes.post('/', validateEmployee, createEmployee);
routes.put('/:id', validateEmployeeUpdate, updateEmployee);
routes.patch('/active/:id', activeEmployee);
routes.patch('/salary/:id', salaryEmployee);

export default routes; 