import express from "express";
import { 
    refundOrder,
    getOrderById
 } from "../controllers/refundController.js";

const router = express.Router();

router.post("/:id", refundOrder);
router.get("/:order_id", getOrderById);

export default router;