import express from "express";
import { 
    getDailySales
} from "../controllers/salesSummaryController.js";

const router = express.Router();

router.get("/daily", getDailySales);

export default router;