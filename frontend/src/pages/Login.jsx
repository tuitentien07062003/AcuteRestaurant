import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, UtensilsCrossed, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useInit from "@/hooks/useInit";
import { GlobalContext } from "@/context/GlobalContext";
import { initLogin, doLogin } from "@/init/loginInit";
import logo from "@/assets/logo.png";
import brand from "@/assets/brand.png";

export default function Login() {
  const navigate = useNavigate();
  const ctx = useContext(GlobalContext);
  useInit(() => initLogin(ctx), []);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");
    try {
      const data = await doLogin(ctx, form);
      const role = data.user.role;
      if (role === "SM" || role === "SUP") {
        navigate("/admin");
      } else if (role === "CREW") {
        navigate("/pos");
      } else {
        navigate("/pos");
      }
    } catch (err) {
      setServerError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Background Decorative - Orange Theme */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[#F97316] rounded-b-[40px] opacity-5 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#F97316] rounded-full opacity-5 pointer-events-none"></div>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-xl border border-slate-100 bg-white rounded-2xl animate-scale-in">
        <CardHeader className="space-y-6 text-center pb-2 pt-8">
          {/* Logo & Brand */}
          <div className="flex justify-center items-center gap-3">
            <div className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#F97316] tracking-tight">
                Acute
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Restaurant
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Chào mừng trở lại!
            </CardTitle>
            <p className="text-sm text-slate-500">
              Đăng nhập để tiếp tục làm việc
            </p>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-5 pt-2 pb-8 px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Tên đăng nhập
              </label>
              <div className="relative">
                <Input
                  name="username"
                  className="bg-slate-50 border-slate-200 h-12 pl-4 pr-4 focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChefHat size={18} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="bg-slate-50 border-slate-200 h-12 pl-4 pr-12 focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#F97316] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                <p className="text-sm text-red-600 text-center font-medium">
                  {serverError}
                </p>
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  className="border-slate-300 data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-[#F97316] hover:text-[#EA580C] font-medium transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#F97316] hover:bg-[#EA580C] cursor-pointer font-semibold text-base shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] rounded-xl text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Đăng nhập</span>
                  <UtensilsCrossed size={18} />
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-slate-400">
              © 2024 Acute Restaurant. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
