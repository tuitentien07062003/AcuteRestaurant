import { fetchMenu } from "../api/menu";

export async function initMenuOrder(ctx, category) {
  if (!category) {
    console.log("[initMenuOrder] No category provided, skipping");
    return;
  }
  
  try {
    console.log("[initMenuOrder] Fetching menu for category:", category);
    const items = await fetchMenu(category);
    console.log("[initMenuOrder] Menu items received:", items);
    ctx.setMenu(items);
  } catch (e) {
    console.error("[initMenuOrder] Error:", e);
  }
}
