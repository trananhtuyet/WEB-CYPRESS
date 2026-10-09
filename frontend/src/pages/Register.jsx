import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
      showToast("Đăng ký thành công");
      navigate("/");
    } catch (error) {
      showToast(error.response?.data?.message || "Đăng ký thất bại", "error");
    }
  };

  return (
    <AuthShell
      activeTab="register"
      title="Tạo tài khoản mới"
      subtitle="Đăng ký để lưu đơn hàng, theo dõi ưu đãi và mua sắm cùng Dolia theo cách riêng của bạn."
      showcaseImage="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90"
      showcaseAlt="Phong cách thời trang Hàn Quốc tươi mới cho trang đăng ký"
      showcaseBadge="Nàng thơ mùa mới"
      showcaseQuote="Một tài khoản mới cho những outfit trẻ trung hơn: cardigan ngắn, chân váy mini và silhouette sạch, nhẹ."
      footer={
        <p className="auth-luxe-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      }
    >
      <form className="auth-luxe-form" onSubmit={handleSubmit}>
        <div className="auth-luxe-grid">
          <div>
            <label htmlFor="name">Họ tên</label>
            <input
              id="name"
              name="name"
              placeholder="Nhập họ tên"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="ban@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Tạo mật khẩu"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="auth-luxe-submit">
          Đăng ký
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
