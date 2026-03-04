import express from 'express';
import { 
    getStoreById, 
    updateStore,
} from '../controllers/storeController.js';

const routes = express.Router();

routes.get('/', getStoreById);

routes.put('/:id', updateStore);

export default routes;