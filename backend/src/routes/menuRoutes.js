import express from 'express';
import { getMenu } from '../controllers/menuItemController.js';

const routes = express.Router();

routes.get('/menu-items', getMenu);

export default routes;