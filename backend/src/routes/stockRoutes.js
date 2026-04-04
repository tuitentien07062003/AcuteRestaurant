import express from 'express';
import { getStockByStore, updateStockItem, bulkUpdateStock } from '../controllers/stockController.js';
import { requireLogin } from '../middlewares/authMiddleware.js';
import { adminOrManager, adminOnly } from '../middlewares/authRole.js';

const router = express.Router();

// Admin only routes
router.get('/:storeId', requireLogin, getStockByStore);
router.put('/:storeId/bulk', requireLogin, bulkUpdateStock);
router.put('/:storeId/:itemId', requireLogin, updateStockItem);

export default router;

