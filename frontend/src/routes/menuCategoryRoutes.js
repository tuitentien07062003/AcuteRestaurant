import express from 'express';
import { 
    getAllMenuCategories,
    createMenuCategory,
    deleteMenuCategory,
    updateMenuCategory
} from '../controllers/menuCategoryController.js';

const routes = express.Router();

routes.get('/', getAllMenuCategories);
routes.post('/', createMenuCategory);
routes.put('/:id', updateMenuCategory);
routes.delete('/:id', deleteMenuCategory);

export default routes;