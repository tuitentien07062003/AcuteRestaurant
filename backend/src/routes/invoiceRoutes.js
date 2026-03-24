import express from 'express';
import { 
  getAllInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice 
} from '../controllers/invoiceController.js';

const routes = express.Router();

routes.get('/', getAllInvoices);
routes.get('/:id', getInvoiceById);
routes.post('/', createInvoice);
routes.put('/:id', updateInvoice);
routes.delete('/:id', deleteInvoice);

export default routes;

