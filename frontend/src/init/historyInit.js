import { fetchBillOrders } from "../api/billOrders";

export async function initHistory(ctx) {
  try {
    console.log("[initHistory] Fetching bills...");
    const bills = await fetchBillOrders();
    console.log("[initHistory] Bills loaded:", bills.length);
    ctx.setBills(bills);
  } catch (e) {
    console.error("[initHistory] Error:", e);
    throw e;
  }
}
