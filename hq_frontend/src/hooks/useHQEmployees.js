import { useState, useEffect, useCallback } from "react";
import { getEmployees } from "../api/employeeApi.js";

export function useHQEmployees(storeId) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    getEmployees(storeId)
      .then((res) => setEmployees(res.data || []))
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { employees, loading, error, refetch: fetch };
}

