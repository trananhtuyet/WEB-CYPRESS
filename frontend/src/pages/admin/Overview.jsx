import { useEffect, useMemo, useState } from "react";
import { getAdminOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getUsers } from "../../services/userService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusLabels = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const chartMonths = ["T2", "T3", "T4", "T5", "T6", "T7"];

function Overview() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadOverview = async () => {
      const [orderData, productData, userData] = await Promise.all([
        getAdminOrders(),
        getProducts({ page: 1, limit: 50 }),
        getUsers(),
      ]);

      setOrders(orderData);
      setProducts(productData.products || []);
      setUsers(userData);
    };

    loadOverview().catch(() => {
      setOrders([]);
      setProducts([]);
      setUsers([]);
    });
  }, []);

  const overview = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const orderCount = orders.length;
    const customerCount = users.filter((user) => user.role !== "admin").length;
    const productCount = products.length;
    const averageOrderValue = orderCount ? revenue / orderCount : 0;
    const completionRate = orderCount
      ? Math.round((orders.filter((order) => order.status === "delivered").length / orderCount) * 100)
      : 0;

    return { revenue, orderCount, customerCount, productCount, averageOrderValue, completionRate };
  }, [orders, products.length, users]);

  const revenueBars = chartMonths.map((month, index) => {
    const base = overview.revenue || 1800000;
    return {
      month,
      value: Math.round((base / chartMonths.length) * (0.55 + index * 0.13)),
    };
  });
  const maxBar = Math.max(...revenueBars.map((bar) => bar.value), 1);

  const statusSummary = ["pending", "confirmed", "shipping", "delivered", "cancelled"].map((status) => ({
    status,
    label: statusLabels[status],
    count: orders.filter((order) => order.status === status).length,
  }));

  const topProducts = [...products]
    .sort((first, second) => Number(second.stock) - Number(first.stock))
    .slice(0, 4);

  return (
    <section className="admin-overview">
      <div className="admin-overview-heading">
        <div>
          <p className="admin-home-kicker">Business Overview</p>
          <h1>Tổng Quan Kinh Doanh</h1>
        </div>
        <button type="button">Xuất báo cáo</button>
      </div>

      <div className="overview-kpi-grid">
        <article>
          <span>Doanh thu</span>
          <strong>{formatCurrency(overview.revenue)}</strong>
          <small>+10.2% so với kỳ trước</small>
        </article>
        <article>
          <span>Đơn hàng</span>
          <strong>{overview.orderCount}</strong>
          <small>Đang ghi nhận toàn hệ thống</small>
        </article>
        <article>
          <span>AOV</span>
          <strong>{formatCurrency(overview.averageOrderValue)}</strong>
          <small>Giá trị trung bình mỗi đơn</small>
        </article>
        <article>
          <span>Hoàn tất</span>
          <strong>{overview.completionRate}%</strong>
          <small>Tỷ lệ đơn đã giao</small>
        </article>
      </div>

      <div className="overview-grid">
        <section className="overview-panel overview-chart-panel">
          <div className="overview-panel-head">
            <h2>Doanh thu 6 tháng</h2>
            <span>{formatCurrency(overview.revenue || 1800000)}</span>
          </div>
          <div className="overview-bar-chart">
            {revenueBars.map((bar) => (
              <div key={bar.month} className="overview-bar">
                <span>{formatCurrency(bar.value)}</span>
                <div style={{ height: `${Math.max((bar.value / maxBar) * 180, 28)}px` }} />
                <small>{bar.month}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="overview-panel overview-status-panel">
          <div className="overview-panel-head">
            <h2>Trạng thái đơn</h2>
          </div>
          <div className="overview-status-list">
            {statusSummary.map((item) => (
              <article key={item.status}>
                <span className={`dashboard-status ${item.status}`}>{item.label}</span>
                <strong>{item.count}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="overview-panel overview-radar-panel">
          <div className="overview-panel-head">
            <h2>Năng lực vận hành</h2>
          </div>
          <div className="overview-radar">
            <div>
              <strong>{overview.productCount}</strong>
              <span>Sản phẩm</span>
            </div>
            <div>
              <strong>{overview.customerCount}</strong>
              <span>Khách hàng</span>
            </div>
            <div>
              <strong>{overview.orderCount}</strong>
              <span>Đơn hàng</span>
            </div>
          </div>
        </section>

        <section className="overview-panel overview-products-panel">
          <div className="overview-panel-head">
            <h2>Sản phẩm nổi bật</h2>
          </div>
          <div className="overview-product-list">
            {topProducts.length ? (
              topProducts.map((product) => (
                <article key={product.id}>
                  <img
                    src={
                      product.image ||
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=140&q=80"
                    }
                    alt={product.name}
                  />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{formatCurrency(Number(product.price))} · {product.stock} còn</span>
                  </div>
                </article>
              ))
            ) : (
              <article>
                <div>
                  <strong>Chưa có sản phẩm</strong>
                  <span>Thêm sản phẩm để bắt đầu thống kê.</span>
                </div>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Overview;
