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
      // SM (Store Manager) or SUP (Supervisor) → Admin Dashboard
      // CREW → POS
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0077b6] via-[#0096c7] to-[#00b4d8]">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-scale-in">
        <CardHeader className="space-y-6 text-center pb-2">
          {/* Logo & Brand */}
          <div className="flex justify-center items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-2xl flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#0077b6] tracking-tight">Acute</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Restaurant</p>
            </div>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Chào mừng trở lại!
            </CardTitle>
            <p className="text-sm text-gray-500">
              Đăng nhập để tiếp tục làm việc
            </p>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-5 pt-2">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tên đăng nhập</label>
              <div className="relative">
                <Input
                  name="username"
                  className="bg-gray-50 border-gray-200 h-12 pl-4 pr-4 focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition-all"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChefHat size={18} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <Input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="bg-gray-50 border-gray-200 h-12 pl-4 pr-12 focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0077b6] transition-colors"
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
                  className="border-gray-300 data-[state=checked]:bg-[#0077b6] data-[state=checked]:border-[#0077b6]"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a href="#" className="text-sm text-[#0077b6] hover:text-[#006699] font-medium transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            {/* Button */}
            <Button
              type="submit"   
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#0077b6] to-[#0096c7] hover:from-[#006699] hover:to-[#0077b6] cursor-pointer font-semibold text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              © 2024 Acute Restaurant. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
