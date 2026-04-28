import express from 'express';
import { 
    getAllStores,
    getStoreById, 
    updateStore,
} from '../controllers/storeController.js';

const routes = express.Router();

routes.get('/', getAllStores);
routes.get('/:id', getStoreById);
routes.put('/:id', updateStore);

export default routes;
