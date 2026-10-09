import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useToast } from "../hooks/useToast";

function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    showToast("Đã ghi nhận yêu cầu đặt lại mật khẩu", "success");
  };

  return (
    <AuthShell
      activeTab="forgot"
      title="Quên mật khẩu?"
      subtitle="Nhập email đã đăng ký, shop sẽ hướng dẫn bạn cách khôi phục tài khoản."
      showcaseImage="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90"
      showcaseAlt="Chân dung thời trang thanh lịch cho trang quên mật khẩu"
      showcaseBadge="Tâm trạng đặt lại thanh lịch"
      showcaseQuote="Ngay cả trang khôi phục tài khoản cũng nên giữ được cảm giác sáng, mềm và thời trang của Dolia."
      footer={
        <p className="auth-luxe-switch">
          Đã nhớ lại mật khẩu? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      }
    >
      <form className="auth-luxe-form" onSubmit={handleSubmit}>
        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          type="email"
          placeholder="ban@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <button type="submit" className="auth-luxe-submit">
          Gửi hướng dẫn
        </button>

        <div className={`auth-luxe-note ${isSubmitted ? "success" : ""}`}>
          <strong>Lưu ý:</strong>
          <span>
            Hiện tại trang này là bước giao diện. Bạn có thể nối thêm API gửi email reset sau.
          </span>
        </div>
      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
