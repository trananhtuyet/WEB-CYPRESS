import { Link } from "react-router-dom";
import Icon from "./Icon";

const defaultShowcaseImage =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90";

function AuthShell({
  activeTab,
  title,
  subtitle,
  children,
  footer,
  panelEyebrow = "Không gian thành viên Dolia",
  showcaseImage = defaultShowcaseImage,
  showcaseAlt = "Không gian thời trang Dolia",
  showcaseQuote = "Những đường nét tối giản, ánh hồng dịu và cảm giác mua sắm cao cấp như trong một boutique thực thụ.",
  showcaseBadge = "Phong cách Hàn Quốc tuyển chọn",
}) {
  return (
    <section className="auth-luxe-screen">
      <div className="auth-luxe-showcase">
        <div className="auth-luxe-mesh" />
        <div className="auth-luxe-orb auth-luxe-orb-top" />
        <div className="auth-luxe-orb auth-luxe-orb-bottom" />
        <div className="auth-luxe-pill" />

        <div className="auth-luxe-story">
          <article className="auth-luxe-photo-card">
            <img src={showcaseImage} alt={showcaseAlt} />
          </article>

          <div className="auth-luxe-copy">
            <span>{panelEyebrow}</span>
            <div className="auth-luxe-kicker">
              <i />
              <strong>{showcaseBadge}</strong>
            </div>
            <h1>
              DOLIA
              <br />
              SHOP
            </h1>
            <p>
              Chào mừng bạn đến với không gian mua sắm hiện đại, nơi trải nghiệm, phom dáng và chất
              lượng luôn được đặt lên hàng đầu.
            </p>

            <div className="auth-luxe-metrics">
              <article>
                <strong>Bộ sưu tập mới</strong>
                <span>Phom may mềm mại và đường nét gọn gàng</span>
              </article>
              <article>
                <strong>Dành cho thành viên</strong>
                <span>Lưu đơn hàng, ưu đãi và phong cách riêng</span>
              </article>
            </div>
          </div>
        </div>

        <div className="auth-luxe-float auth-luxe-float-bag" aria-hidden="true">
          <Icon name="products" size={28} />
        </div>
        <div className="auth-luxe-float auth-luxe-float-cart" aria-hidden="true">
          <Icon name="cart" size={28} />
        </div>

        <div className="auth-luxe-floating-quote">
          <span>Ghi chú biên tập</span>
          <p>{showcaseQuote}</p>
        </div>

        <p className="auth-luxe-copyright">© 2026 DOLIA SHOP | Tất cả quyền được bảo lưu.</p>
      </div>

      <div className="auth-luxe-panel">
        <div className="auth-luxe-header-art" aria-hidden="true" />
        <div className="auth-luxe-panel-glow auth-luxe-panel-glow-top" aria-hidden="true" />
        <div className="auth-luxe-panel-glow auth-luxe-panel-glow-bottom" aria-hidden="true" />

        <div className="auth-luxe-card">
          <div className="auth-luxe-card-shell">
            <div className="auth-luxe-card-crest">
              <span>Truy cập riêng</span>
              <strong>Dolia Wardrobe Club</strong>
            </div>

            <nav className="auth-luxe-tabs" aria-label="Điều hướng xác thực">
              <Link to="/login" className={activeTab === "login" ? "active" : ""}>
                Đăng nhập
              </Link>
              <Link to="/register" className={activeTab === "register" ? "active" : ""}>
                Đăng ký
              </Link>
              <Link to="/forgot-password" className={activeTab === "forgot" ? "active" : ""}>
                Quên mật khẩu
              </Link>
            </nav>

            <div className="auth-luxe-form-wrap">
              <div className="auth-luxe-heading">
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </div>

              {children}

              {footer ? <div className="auth-luxe-footer">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthShell;
