import { useState, useEffect, useCallback } from "react";
import { getStores, getStoreById, getStoreSales, updateStoreSales, getPayrollDaily } from "../api/storeApi.js";

export function useStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStores()
      .then((res) => {
        if (!cancelled) setStores(res.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { stores, loading, error };
}

export function useStoreDetail(id) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getStoreById(id)
      .then((res) => {
        if (!cancelled) setStore(res.data || null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  return { store, loading, error };
}

export function useStoreSales(id, from, to) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getStoreSales(id, from, to)
      .then((res) => setSales(res.data || []))
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [id, from, to]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, loading, error, refetch: fetchSales };
}

export function useUpdateStoreSales() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, date, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateStoreSales(id, date, data);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

export function useStorePayrollDaily(date, storeId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    if (!date || !storeId) return;
    setLoading(true);
    getPayrollDaily(date, storeId)
      .then((res) => setData(res.data || null))
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [date, storeId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
