import { login as loginApi } from "../api/auth";

// Login page init - don't try to fetch user, just reset state
export async function initLogin(ctx) {
  // On login page, don't auto-check user
  // Just ensure user state is clean
  console.log("[initLogin] Login page initialized");
}

export async function doLogin(ctx, form) {
  const data = await loginApi(form);
  ctx.setUser(data.user);
  return data;
}
