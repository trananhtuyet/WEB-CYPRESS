import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container fashion-footer site-fashion-footer">
        <div>
          <Link to="/" className="fashion-footer-brand">
            <BrandLogo theme="footer" showTagline={false} />
          </Link>
          <p>Thời trang tối giản, dễ mặc và bền dáng cho nhịp sống hằng ngày.</p>
        </div>
        <nav>
          <strong>Mua sắm</strong>
          <a href="/#categories">Danh mục</a>
          <a href="/#new">Sản phẩm mới</a>
          <a href="/#best">Bán chạy</a>
        </nav>
        <nav>
          <strong>Hỗ trợ</strong>
          <Link to="/orders">Đơn hàng</Link>
          <Link to="/cart">Giỏ hàng</Link>
          <Link to="/contact">Liên hệ</Link>
          <a href="tel:0911408966">091 140 8966</a>
        </nav>
        <div>
          <strong>Liên hệ</strong>
          <span>hello@dolia.vn</span>
          <span>48 Nguyễn Trãi, Quận 1</span>
          <Link to="/contact">Gửi yêu cầu hỗ trợ</Link>
          <span>09:00 - 21:00 mỗi ngày</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
