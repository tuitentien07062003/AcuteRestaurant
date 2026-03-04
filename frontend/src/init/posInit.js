import { fetchMenuCategories } from "../api/menuCategories";
import { fetchMenu } from "../api/menu";

export async function initPos(ctx) {
  // load categories if not present
  if (ctx.categories && ctx.categories.length > 0) {
    console.log("[initPos] Categories already loaded");
    return;
  }
  
  try {
    console.log("[initPos] Fetching categories...");
    const cats = await fetchMenuCategories();
    console.log("[initPos] Categories received:", cats?.length);
    if (!cats || cats.length === 0) {
      console.warn("[initPos] Received empty categories");
      return;
    }
    ctx.setCategories(cats);
    ctx.setActiveCategory(cats[0].code);
    
    console.log("[initPos] Fetching menu for category:", cats[0].code);
    const menu = await fetchMenu(cats[0].code);
    console.log("[initPos] Menu received:", menu?.length);
    ctx.setMenu(menu);
  } catch (e) {
    console.error("[initPos] Error:", e?.response?.status, e?.message || e);
    if (e?.response?.status === 401) {
      console.warn("[initPos] Session expired, will redirect to login");
      // Interceptor will handle redirect
    }
  }
}
