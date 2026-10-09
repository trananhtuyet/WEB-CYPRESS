import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await login(form);
      showToast("Đăng nhập thành công");
      navigate(data.user?.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (error) {
      showToast(error.response?.data?.message || "Đăng nhập thất bại", "error");
    }
  };

  return (
    <AuthShell
      activeTab="login"
      title="Chào mừng trở lại!"
      subtitle="Vui lòng đăng nhập để tiếp tục mua sắm cùng Dolia Shop."
      showcaseImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90"
      showcaseAlt="Phong cách thời trang Hàn Quốc hiện đại cho trang đăng nhập"
      showcaseBadge="Bản phối may đo mềm"
      showcaseQuote="Đăng nhập để quay lại tủ đồ phong cách với blazer phom hộp, denim suông và bảng màu sáng hiện đại."
    >
      <form id="login-form" className="auth-luxe-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="admin@cosmetics.local"
          autoComplete="email"
          autoFocus
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />

        <div className="auth-luxe-label-row">
          <label htmlFor="password">Mật khẩu</label>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />

        <button id="login-submit" type="submit" className="auth-luxe-submit">
          Đăng nhập
        </button>

        <div className="auth-luxe-divider">
          <span>Hoặc đăng nhập với</span>
        </div>
        <div className="auth-luxe-socials">
          <button type="button" aria-label="Đăng nhập với Google">G</button>
          <button type="button" aria-label="Đăng nhập với Facebook">f</button>
          <button type="button" aria-label="Đăng nhập với LinkedIn">in</button>
        </div>

        <div className="auth-luxe-note">
          <strong>Tài khoản test:</strong>
          <span>Email: admin@cosmetics.local | Mật khẩu: Admin@123</span>
        </div>
      </form>
    </AuthShell>
  );
}

export default Login;
