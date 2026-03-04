import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

    const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");
    try {
      const res = await axios.post(
        "https://acuterestaurant.onrender.com/acute/auth/login",
        form,
        { withCredentials: true }
      );

      const role = res.data.user.role;

      // redirect theo role
      if (role === "SM" || role === "SUP" || role === "CREW") navigate("/pos");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-none bg-gray-100">
        
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center items-center gap-2 text-[#0077b6] font-bold text-xl">
            <span className="w-3 h-3 bg-[#0077b6] rounded-sm rotate-12" />
            Acute
          </div>

          <CardTitle className="text-2xl font-semibold">
            Đăng nhập
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Chào mừng bạn trở lại!
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-5">
  <form onSubmit={handleLogin} className="space-y-5">

    {/* Username */}
    <div className="space-y-1">
      <label className="text-sm font-medium">Tên đăng nhập</label>
      <Input
        name="username"
        className="bg-white mt-2"
        value={form.username}
        onChange={handleChange}
      />
    </div>

    {/* Password */}
    <div className="space-y-1">
      <label className="text-sm font-medium">Mật khẩu</label>
      <div className="relative mt-2">
        <Input
          name="password"
          value={form.password}
          onChange={handleChange}
          type={showPassword ? "text" : "password"}
          className="pr-10 bg-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>

    {/* Error */}
    {serverError && (
      <p className="text-sm text-red-600">
        {serverError}
      </p>
    )}

    {/* Remember */}
    <div className="flex items-center gap-2">
      <Checkbox id="remember" />
      <label htmlFor="remember" className="text-sm cursor-pointer">
        Ghi nhớ đăng nhập
      </label>
      <a href="#" className="ml-auto text-sm text-[#0077b6] hover:underline">
        Quên mật khẩu?
      </a>
    </div>

    {/* Button */}
    <Button
      type="submit"   
      disabled={loading}
      className="w-full bg-[#0077b6] hover:bg-[#006699] cursor-pointer"
    >
      {loading ? "Đang đăng nhập..." : "Xác nhận"}
    </Button>

  </form>

        </CardContent>
      </Card>
    </div>
  );
}
