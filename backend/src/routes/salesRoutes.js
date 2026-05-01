import express from "express";
import { 
    getDailySales,
    getSalesForecast,
    trainSalesForecast,
} from "../controllers/salesSummaryController.js";

const router = express.Router();

router.get("/daily", getDailySales);
router.get("/forecast", getSalesForecast);
router.post("/forecast/train", trainSalesForecast);

export default router;
