import express from 'express';
import { createUser, getAllUsers } from '../controllers/userController.js';

const routes = express.Router();

routes.post('/create-user', createUser);
routes.get('/', getAllUsers);

export default routes;