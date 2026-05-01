import { useState, useEffect, useCallback } from "react";
import { getForecast } from "../api/forecastApi.js";

export function useForecastAdmin(storeId, days = 7) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getForecast(storeId, days);
      setForecastData(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Lỗi lấy dự báo";
      setError(msg);
      console.error("[useForecastAdmin] Lỗi:", msg);
    } finally {
      setLoading(false);
    }
  }, [storeId, days]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { forecastData, loading, error, refetch: fetch };
}

