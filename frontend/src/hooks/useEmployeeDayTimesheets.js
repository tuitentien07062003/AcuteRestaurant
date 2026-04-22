import { useQuery } from '@tanstack/react-query';
import payrollApi from '@/api/payrollApi';

/**
 * Custom hook để lấy danh sách timesheets nhân viên part-time trong ngày
 * Cache 15 phút, tự động refetch mỗi 30 phút
 * @param {string} date - Ngày cần lấy (format: YYYY-MM-DD)
 * @param {number} storeId - ID cửa hàng
 * @param {number} page - Số trang (default: 1)
 * @param {number} limit - Số bản ghi trên trang (default: 20)
 * @returns {Object} { data, isLoading, error, isError, refetch }
 */
export function useEmployeeDayTimesheets(date, storeId, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['employeeDayTimesheets', date, storeId, page, limit],
    queryFn: () => payrollApi.getEmployeeDayTimesheets(date, storeId, page, limit),
    enabled: !!date && !!storeId,
    staleTime: 15 * 60 * 1000, // 15 phút
    gcTime: 60 * 60 * 1000, // 60 phút
    refetchInterval: 30 * 60 * 1000, // Auto refetch mỗi 30 phút
  });
}
