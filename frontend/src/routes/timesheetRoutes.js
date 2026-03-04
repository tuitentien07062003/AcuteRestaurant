import express from 'express';
import { checkInOut, getTimesheets } from '../controllers/timesheetController.js';

const routes = express.Router();

routes.post('/check-in', checkInOut);
routes.get('/', getTimesheets);

export default routes;