import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { favoriteCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = search.trim();
    navigate(keyword ? `/?search=${encodeURIComponent(keyword)}` : "/");
  };

  return (
    <>
      <div className="fashion-top-strip">
        <span>Miễn phí vận chuyển cho đơn từ 699K</span>
        <span>Hotline: 091 140 8966</span>
        <span>Đổi trả trong 7 ngày</span>
      </div>

      <header className="fashion-header">
        <Link to="/" className="fashion-brand">
          <BrandLogo theme="header" />
        </Link>

        <form className="fashion-search" role="search" onSubmit={handleSearchSubmit}>
          <button id="header-search-submit" className="fashion-search-submit" type="submit" aria-label="Tìm kiếm">
            <Icon name="search" />
          </button>
          <input
            id="header-search-input"
            type="search"
            placeholder="Tìm áo, quần, giày, phụ kiện..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>

        <div className="fashion-header-actions">
          <Link to="/favorites" aria-label="Sản phẩm yêu thích">
            <Icon name="heart" size={20} />
            <span>{favoriteCount}</span>
          </Link>
          {isUser && (
            <Link to="/cart" aria-label="Giỏ hàng">
              <Icon name="cart" size={20} />
              <span>{cart.items?.length || 0}</span>
            </Link>
          )}
          {user ? (
            <>
              <Link to={isAdmin ? "/admin" : "/account"} aria-label="Tài khoản">
                {user.avatar ? <img className="fashion-header-avatar" src={user.avatar} alt={user.name} /> : <Icon name="account" size={20} />}
                <strong>{user.name}</strong>
              </Link>
              <button
                id="header-logout-button"
                type="button"
                className="fashion-icon-action"
                onClick={handleLogout}
                aria-label="Đăng xuất"
              >
                <Icon name="logout" size={20} />
              </button>
            </>
          ) : (
            <>
              <Link id="header-login-link" to="/login" reloadDocument>Đăng nhập</Link>
            </>
          )}
        </div>
      </header>

      <nav className="fashion-nav">
        <NavLink to="/">Trang chủ</NavLink>
        <a href="/#categories">Danh mục</a>
        <a href="/#new">Sản phẩm mới</a>
        <a href="/#best">Bán chạy</a>
        <a href="/#story">Thương hiệu</a>
        <NavLink to="/contact">Liên hệ</NavLink>
        {isUser && <NavLink to="/account">Tài khoản</NavLink>}
        {isUser && <NavLink to="/orders">Đơn hàng</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
    </>
  );
}

export default Header;
