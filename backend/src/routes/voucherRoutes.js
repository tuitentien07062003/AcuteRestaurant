import express from 'express';
import { 
    getAllVouchers, 
    getVoucherById,
    getVoucherByCode,
    createVoucher, 
    updateVoucher, 
    activeVoucher,
    deleteVoucher
} from '../controllers/voucherController.js';

const routes = express.Router();

routes.get('/', getAllVouchers);
routes.get('/:id', getVoucherById);
routes.get('/code/:code', getVoucherByCode);
routes.post('/', createVoucher);
routes.put('/:id', updateVoucher);
routes.patch('/active/:id', activeVoucher);
routes.delete('/:id', deleteVoucher);

export default routes;