import express from 'express';
import { 
  getAllInventories, 
  getInventoryById, 
  createInventory, 
  updateInventory, 
  deleteInventory 
} from '../controllers/inventoryController.js';

const routes = express.Router();

routes.get('/', getAllInventories);
routes.get('/:id', getInventoryById);
routes.post('/', createInventory);
routes.put('/:id', updateInventory);
routes.delete('/:id', deleteInventory);

export default routes;

