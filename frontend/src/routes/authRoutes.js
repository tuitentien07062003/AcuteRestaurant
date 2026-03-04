import express from 'express';
import { login, logout, me } from '../controllers/authController.js';

const routes = express.Router();

routes.post('/login', login);
routes.post('/logout', logout);
routes.get('/me', me);

export default routes;