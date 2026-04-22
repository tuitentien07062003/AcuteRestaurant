import { useQuery } from '@tanstack/react-query';
import payrollApi from '@/api/payrollApi';

/**
 * Custom hook để lấy tóm tắt lương tháng
 * Cache 60 phút (dữ liệu tháng ít thay đổi)
 * @param {number} month - Tháng (1-12)
 * @param {number} year - Năm
 * @param {number} storeId - ID cửa hàng
 * @returns {Object} { data, isLoading, error, isError, refetch }
 */
export function useMonthlySalarySummary(month, year, storeId) {
  return useQuery({
    queryKey: ['monthlySalarySummary', month, year, storeId],
    queryFn: () => payrollApi.getMonthlySalarySummary(month, year, storeId),
    enabled: !!month && !!year && !!storeId,
    staleTime: 60 * 60 * 1000, // 60 phút
    gcTime: 2 * 60 * 60 * 1000, // 120 phút
  });
}
