import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { getAdminOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getUsers } from "../../services/userService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
};

const orderStatusLabels = {
  pending: "Đang xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Hủy bỏ",
};

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [orderData, productData, userData] = await Promise.all([
        getAdminOrders(),
        getProducts({ page: 1, limit: 8 }),
        getUsers(),
      ]);

      setOrders(orderData);
      setProducts(productData.products || []);
      setUsers(userData);
    };

    loadDashboard().catch(() => {
      setOrders([]);
      setProducts([]);
      setUsers([]);
    });
  }, []);

  const summary = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const lowStockProducts = products.filter((product) => Number(product.stock) <= 10).length;
    const customers = users.filter((user) => user.role !== "admin").length;

    return { revenue, pendingOrders, lowStockProducts, customers };
  }, [orders, products, users]);

  const quickActions = [
    {
      title: "Quản Lý Đơn Hàng",
      description: `${summary.pendingOrders} đơn đang chờ xử lý`,
      to: "/admin/orders",
      icon: "orders",
    },
    {
      title: "Quản Lý Sản Phẩm",
      description: `${summary.lowStockProducts} sản phẩm sắp hết kho`,
      to: "/admin/products",
      icon: "products",
    },
    {
      title: "Quản Lý Khách Hàng",
      description: `${summary.customers} khách hàng đang hoạt động`,
      to: "/admin/users",
      icon: "users",
    },
    {
      title: "Tổng Quan Kinh Doanh",
      description: "Xem KPI, tỷ lệ đơn và hiệu suất",
      to: "/admin/overview",
      icon: "overview",
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products
    .filter((product) => Number(product.stock) <= 15)
    .sort((first, second) => Number(first.stock) - Number(second.stock))
    .slice(0, 4);

  return (
    <section className="admin-home">
      <div className="admin-home-hero">
        <div>
          <p className="admin-home-kicker">Dolia Admin Workspace</p>
          <h1>Điều hành cửa hàng quần áo trong một màn hình.</h1>
          <p>
            Theo dõi doanh thu, xử lý đơn hàng, cập nhật tồn kho và chăm sóc khách hàng từ các lối tắt quản trị.
          </p>
        </div>
        <div className="admin-home-revenue-card">
          <span>Doanh thu hiện tại</span>
          <strong>{formatCurrency(summary.revenue)}</strong>
          <small>Đồng bộ từ đơn hàng trong hệ thống</small>
        </div>
      </div>

      <div className="admin-home-actions">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.to} className="admin-home-action-card">
            <i><Icon name={action.icon} /></i>
            <strong>{action.title}</strong>
            <span>{action.description}</span>
          </Link>
        ))}
      </div>

      <div className="admin-home-grid">
        <section className="admin-home-panel">
          <div className="admin-home-panel-head">
            <h2>Đơn hàng gần đây</h2>
            <Link to="/admin/orders">Xem tất cả</Link>
          </div>
          <div className="admin-home-list">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <article key={order.id} className="admin-home-list-row">
                  <div>
                    <strong>DH{String(order.id).padStart(3, "0")}</strong>
                    <span>{order.user?.name || "Khách lẻ"} · {formatDate(order.created_at)}</span>
                  </div>
                  <div>
                    <strong>{formatCurrency(Number(order.total_price))}</strong>
                    <span className={`dashboard-status ${order.status}`}>{orderStatusLabels[order.status]}</span>
                  </div>
                </article>
              ))
            ) : (
              <article className="admin-home-list-row">
                <div>
                  <strong>Chưa có đơn hàng</strong>
                  <span>Đơn mới sẽ xuất hiện tại đây.</span>
                </div>
              </article>
            )}
          </div>
        </section>

        <section className="admin-home-panel">
          <div className="admin-home-panel-head">
            <h2>Cảnh báo tồn kho</h2>
            <Link to="/admin/products">Cập nhật kho</Link>
          </div>
          <div className="admin-home-list">
            {lowStockProducts.length ? (
              lowStockProducts.map((product) => (
                <article key={product.id} className="admin-home-stock-row">
                  <img
                    src={
                      product.image ||
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=140&q=80"
                    }
                    alt={product.name}
                  />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.stock} sản phẩm còn lại</span>
                  </div>
                </article>
              ))
            ) : (
              <article className="admin-home-list-row">
                <div>
                  <strong>Tồn kho ổn định</strong>
                  <span>Không có sản phẩm nào dưới ngưỡng cảnh báo.</span>
                </div>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
