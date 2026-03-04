import express from "express";
import {
    createBillOrder,
    getBillOrders,
    getBillOrderDetails,
    updateOrderStatus,
    completeOrder,
} from "../controllers/billOrderController.js";

const router = express.Router();

router.post("/", createBillOrder);
router.get("/", getBillOrders);
router.get("/:bill_id", getBillOrderDetails);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/complete", completeOrder);

export default router;