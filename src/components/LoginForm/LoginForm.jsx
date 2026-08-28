import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { setUserInfo } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    }
    return newErrors;
  };

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await api.post("/api/auth/login", { username, password });
        const token = res.data?.data?.access_token;

        if (!token) throw new Error("Không nhận được token từ server");
        if (!isTokenValid(token)) throw new Error("Token không hợp lệ");

        localStorage.setItem("jwt", token);
        const tempUser = { username, fullName: username };
        setUserInfo(tempUser);
        localStorage.setItem("userInfo", JSON.stringify(tempUser));

        navigate("/");
      } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Đăng nhập thất bại!";
        setErrors(prev => ({ ...prev, server: backendMsg }));
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e0eaf4] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      <div className="w-full max-w-[360px] bg-white border border-[#96afc8] rounded shadow-xl overflow-hidden animate-[fadein_0.3s_ease]">
        
        {/* Header - Gradient MES Style */}
        <div className="bg-gradient-to-b from-[#f0f4f8] to-[#d8e4f0] border-b-2 border-[#96afc8] p-4 text-center">
          <h2 className="m-0 text-base font-extrabold text-[#1a3a5c] uppercase tracking-wider">
            Hệ Thống MES - Đăng Nhập
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Lỗi từ server */}
            {errors.server && (
              <div className="p-2 text-[12px] font-semibold text-[#b91c1c] bg-[#fee2e2] border border-[#f87171] rounded-sm text-center">
                {errors.server}
              </div>
            )}

            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#1a3a5c] uppercase tracking-tight">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tài khoản hệ thống"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-8 px-3 text-[13px] font-semibold text-[#1a3a5c] border border-[#6890b0] rounded-sm outline-none bg-white placeholder:text-[#8aabca] placeholder:font-normal focus:border-[#1565C0] focus:ring-[3px] focus:ring-[#1565C0]/15 transition-all"
              />
              {errors.username && (
                <p className="text-[#b91c1c] text-[11px] font-semibold mt-0.5">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#1a3a5c] uppercase tracking-tight">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-8 px-3 text-[13px] font-semibold text-[#1a3a5c] border border-[#6890b0] rounded-sm outline-none bg-white placeholder:text-[#8aabca] placeholder:font-normal focus:border-[#1565C0] focus:ring-[3px] focus:ring-[#1565C0]/15 transition-all"
              />
              {errors.password && (
                <p className="text-[#b91c1c] text-[11px] font-semibold mt-0.5">{errors.password}</p>
              )}
            </div>

            {/* Forget Password */}
            <div className="text-right">
              <Link to="/resetpass" className="text-[11px] text-[#1565C0] font-bold hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-b from-[#1e3a5c] to-[#1565C0] border border-[#0d47a1] text-white py-2 text-[13px] font-bold rounded-sm cursor-pointer uppercase mt-2 hover:from-[#2b4d70] hover:to-[#1976D2] active:from-[#0d47a1] transition-all shadow-sm"
            >
              Xác nhận đăng nhập
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f6fc] border-t border-[#d8e8f4] text-center text-xs">
          <p className="mb-2 text-gray-600">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-[#1565C0] font-bold hover:underline uppercase">
              Đăng ký mới
            </Link>
          </p>
          <Link to="/" className="text-[#1565C0]/70 font-bold hover:underline hover:text-[#1565C0]">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Animation CSS (Nếu tailwind chưa config animation fadein) */}
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}