import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Icon from "./Icon";
import BrandLogo from "./BrandLogo";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getAdminSearchPath = (keyword) => {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) return "/admin";
    return `/admin/search?search=${encodeURIComponent(keyword)}`;
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(getAdminSearchPath(search));
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand-block">
          <BrandLogo className="admin-brand-logo" theme="admin" adminLabel />
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            <span><Icon name="dashboard" /></span> Dashboard
          </NavLink>
          <NavLink to="/admin/overview">
            <span><Icon name="overview" /></span> Tổng Quan
          </NavLink>
          <NavLink to="/admin/orders">
            <span><Icon name="orders" /></span> Quản Lý Đơn Hàng
          </NavLink>
          <NavLink to="/admin/products">
            <span><Icon name="products" /></span> Quản Lý Sản Phẩm
          </NavLink>
          <NavLink to="/admin/users">
            <span><Icon name="users" /></span> Quản Lý Khách Hàng
          </NavLink>
          <NavLink to="/admin/contacts">
            <span><Icon name="mail" /></span> Liên Hệ
          </NavLink>
          <NavLink to="/admin/vouchers">
            <span><Icon name="money" /></span> Voucher
          </NavLink>
          <NavLink to="/admin/payments">
            <span><Icon name="money" /></span> QR Thanh Toán
          </NavLink>
          <NavLink to="/admin/reports">
            <span><Icon name="report" /></span> Báo Cáo
          </NavLink>
          <NavLink to="/admin/settings">
            <span><Icon name="settings" /></span> Cài Đặt
          </NavLink>
          <NavLink to="/admin/support">
            <span><Icon name="help" /></span> Hỗ Trợ
          </NavLink>
        </nav>

        <NavLink to="/" className="admin-store-link">
          Xem Cửa Hàng
        </NavLink>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <form className="admin-search" onSubmit={handleSearchSubmit}>
            <span><Icon name="search" /></span>
            <input
              type="search"
              placeholder="Tìm kiếm đơn hàng, sản phẩm, khách hàng..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <div className="admin-topbar-actions">
            <div className="admin-profile">
              <div className="admin-avatar">
                {user?.avatar ? <img src={user.avatar} alt={user?.name || "Admin"} /> : user?.name?.charAt(0) || "A"}
              </div>
              <div>
                <strong>{user?.name || "Admin"}</strong>
                <span>Admin</span>
              </div>
              <button type="button" onClick={handleLogout} aria-label="Logout">
                <Icon name="chevronDown" />
              </button>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
