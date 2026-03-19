import { fetchEmployees } from '@/api/employees';

export async function initAdminEmployees(ctx) {
  // Smart check giống POS
  if (ctx.employees.length > 0) return;

  ctx.setLoading(true);
  try {
    const data = await fetchEmployees();
    ctx.setEmployees(data);
  } catch (e) {
    ctx.setError(e.message);
  } finally {
    ctx.setLoading(false);
  }
}