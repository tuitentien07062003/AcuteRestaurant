import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/acute/hq",
  headers: { "Content-Type": "application/json" },
});

/**
 * Lấy dự báo doanh thu từ AI Service (qua backend proxy, no auth)
 * @param {number} storeId
 * @param {number} days
 */
export const getForecast = (storeId, days = 7) =>
  api.get("/forecast", { params: { store_id: storeId, days } });

/**
 * Trigger train model thủ công
 * @param {number} storeId
 */
export const triggerForecastTrain = (storeId) =>
  api.post("/forecast/train", { store_id: storeId });
