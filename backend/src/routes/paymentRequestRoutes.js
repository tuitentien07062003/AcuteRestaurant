import express from 'express';
import { 
  getAllPaymentRequests, 
  getPaymentRequestById, 
  createPaymentRequest, 
  updatePaymentRequestStatus, 
  deletePaymentRequest 
} from '../controllers/paymentRequestController.js';

const routes = express.Router();

routes.get('/', getAllPaymentRequests);
routes.get('/:id', getPaymentRequestById);
routes.post('/', createPaymentRequest);
routes.patch('/:id/status', updatePaymentRequestStatus);
routes.delete('/:id', deletePaymentRequest);

export default routes;

