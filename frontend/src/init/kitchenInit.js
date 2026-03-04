// kitchen initialization sets up bill orders
import { fetchBillOrders } from "../api/billOrders";

export async function initKitchen(ctx) {
  try {
    console.log("[initKitchen] Loading bills...");
    const bills = await fetchBillOrders();
    console.log("[initKitchen] Bills loaded:", bills.length);
    ctx.setBills(bills);
  } catch (e) {
    console.error("[initKitchen] Error:", e);
    throw e;
  }
}
