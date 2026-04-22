import { useQuery } from '@tanstack/react-query';
import payrollApi from '@/api/payrollApi';

/**
 * Custom hook để lấy tóm tắt lương ngày
 * Cache 30 phút, tự động refetch nếu stale
 * @param {string} date - Ngày cần lấy (format: YYYY-MM-DD)
 * @param {number} storeId - ID cửa hàng
 * @returns {Object} { data, isLoading, error, isError, refetch }
 */
export function useDailySalarySummary(date, storeId) {
  return useQuery({
    queryKey: ['dailySalarySummary', date, storeId],
    queryFn: () => payrollApi.getDailySalarySummary(date, storeId),
    enabled: !!date && !!storeId, // Chỉ chạy khi cả date và storeId có giá trị
    staleTime: 30 * 60 * 1000, // 30 phút
    gcTime: 60 * 60 * 1000, // 60 phút
    refetchInterval: 30 * 60 * 1000, // Auto refetch mỗi 30 phút
  });
}
