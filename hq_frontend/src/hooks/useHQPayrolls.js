import { useState, useEffect } from "react";
import { getHqPayrolls, getPayrollById } from "../api/payrollApi.js";

export function useHQPayrolls(month, year, status) {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getHqPayrolls(month, year, status);
        setPayrolls(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Lỗi tải bảng lương");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [month, year, status]);

  return { payrolls, loading, error };
}

export function usePayrollDetail(payrollId) {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!payrollId) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPayrollById(payrollId);
        setPayroll(res.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Lỗi tải chi tiết bảng lương");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [payrollId]);

  return { payroll, loading, error };
}

