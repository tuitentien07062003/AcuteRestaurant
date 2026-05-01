import { useState, useCallback } from "react";
import { getForecast, triggerForecastTrain } from "../api/forecastApi.js";

export function useForecast() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = useCallback(async (storeId, days = 7) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getForecast(storeId, days);
      setForecastData(res.data);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Lỗi lấy dự báo";
      setError(msg);
      console.error("[useForecast] Lỗi:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const trainModel = useCallback(async (storeId) => {
    try {
      const res = await triggerForecastTrain(storeId);
      return res.data;
    } catch (err) {
      console.error("[useForecast] Train lỗi:", err?.response?.data?.message || err.message);
      throw err;
    }
  }, []);

  return { forecastData, loading, error, fetchForecast, trainModel };
}

