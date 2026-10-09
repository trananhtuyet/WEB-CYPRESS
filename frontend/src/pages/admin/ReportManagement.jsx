import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/Icon";
import { getAdminOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getUsers } from "../../services/userService";

const monthLabels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

const statusLabels = {
  pending: "Đang xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Hủy bỏ",
};

const paymentLabels = {
  paid: "Đã thanh toán",
  pending: "Chờ thanh toán",
  processing: "Đang xử lý",
  failed: "Thanh toán lỗi",
  cancelled: "Đã hủy",
  unpaid: "Chưa thanh toán",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

const formatInputDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const parseValidDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDateBoundary = (value, endOfDay = false) => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
};

const getPaymentStatus = (order) => order.paymentTransaction?.status || "unpaid";

const getMonthKey = (date) => {
  const value = parseValidDate(date);
  if (!value) return "";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
};

const getInitialMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getInitialYear = () => String(new Date().getFullYear());

const normalizeMonthValue = (value) => {
  if (typeof value !== "string") return getInitialMonth();
  const match = value.match(/^(\d{4})-(\d{2})$/);
  return match ? value : getInitialMonth();
};

const normalizeDateValue = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? value : fallback;
};

const normalizeYearValue = (value) => {
  if (typeof value !== "string") return getInitialYear();
  const match = value.match(/^\d{4}$/);
  return match ? value : getInitialYear();
};

const getRangeLabel = ({ filterMode, quickRange, selectedMonth, startDate, endDate }) => {
  if (filterMode === "month") {
    const [year, month] = normalizeMonthValue(selectedMonth).split("-");
    return `thang-${month || "xx"}-${year || "yyyy"}`;
  }

  if (filterMode === "day") {
    return `ngay-${startDate || "chua-chon"}`;
  }

  if (filterMode === "year") {
    return `nam-${startDate || "yyyy"}`;
  }

  if (filterMode === "custom") {
    return `${startDate || "tu-ngay"}_${endDate || "den-ngay"}`;
  }

  return quickRange === "all" ? "tat-ca" : `${quickRange}-ngay`;
};

const downloadCsv = (rows, label = "tat-ca") => {
  const header = [
    "Mã đơn",
    "Khách hàng",
    "Email",
    "Ngày đặt",
    "Sản phẩm",
    "Số lượng",
    "Tổng tiền",
    "Trạng thái đơn",
    "Trạng thái thanh toán",
    "Cổng thanh toán",
  ];
  const lines = rows.map((order) => [
    `DH${String(order.id).padStart(3, "0")}`,
    order.user?.name || "Khach le",
    order.user?.email || "",
    formatDate(order.created_at),
    (order.items || []).map((item) => `${item.product?.name || "Sản phẩm"} x${item.quantity}`).join("; "),
    (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    Number(order.total_price || 0),
    statusLabels[order.status] || order.status,
    paymentLabels[getPaymentStatus(order)] || getPaymentStatus(order),
    order.paymentTransaction?.gateway || "manual",
  ]);

  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dolia-report-${label}-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

function ReportManagement() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterMode, setFilterMode] = useState("quick");
  const [quickRange, setQuickRange] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth());
  const [selectedDay, setSelectedDay] = useState(() => formatInputDate(new Date()));
  const [selectedYear, setSelectedYear] = useState(getInitialYear());
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatInputDate(date);
  });
  const [endDate, setEndDate] = useState(() => formatInputDate(new Date()));
  const [loading, setLoading] = useState(true);

  const safeSelectedMonth = normalizeMonthValue(selectedMonth);
  const safeSelectedDay = normalizeDateValue(selectedDay, formatInputDate(new Date()));
  const safeSelectedYear = normalizeYearValue(selectedYear);
  const safeStartDate = normalizeDateValue(startDate);
  const safeEndDate = normalizeDateValue(endDate);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [orderData, productData, userData] = await Promise.all([
          getAdminOrders(),
          getProducts({ page: 1, limit: 100 }),
          getUsers(),
        ]);

        setOrders(orderData);
        setProducts(productData.products || []);
        setUsers(userData);
      } finally {
        setLoading(false);
      }
    };

    loadReports().catch(() => {
      setOrders([]);
      setProducts([]);
      setUsers([]);
      setLoading(false);
    });
  }, []);

  const handleFilterModeChange = (nextMode) => {
    setFilterMode(nextMode);

    if (nextMode === "day") {
      setSelectedDay((current) => normalizeDateValue(current, formatInputDate(new Date())));
      return;
    }

    if (nextMode === "month") {
      setSelectedMonth((current) => normalizeMonthValue(current));
      return;
    }

    if (nextMode === "year") {
      setSelectedYear((current) => normalizeYearValue(current));
      return;
    }

    if (nextMode === "custom") {
      const today = formatInputDate(new Date());
      setStartDate((current) => normalizeDateValue(current, today));
      setEndDate((current) => normalizeDateValue(current, today));
    }
  };

  const filteredOrders = useMemo(() => {
    if (filterMode === "day") {
      return orders.filter((order) => formatInputDate(order.created_at) === safeSelectedDay);
    }

    if (filterMode === "month") {
      return orders.filter((order) => getMonthKey(order.created_at) === safeSelectedMonth);
    }

    if (filterMode === "year") {
      return orders.filter((order) => {
        const createdAt = parseValidDate(order.created_at);
        return createdAt ? String(createdAt.getFullYear()) === safeSelectedYear : false;
      });
    }

    if (filterMode === "custom") {
      const start = parseDateBoundary(safeStartDate);
      const end = parseDateBoundary(safeEndDate, true);

      return orders.filter((order) => {
        const createdAt = parseValidDate(order.created_at);
        if (!createdAt) return false;
        if (start && createdAt < start) return false;
        if (end && createdAt > end) return false;
        return true;
      });
    }

    if (quickRange === "all") return orders;

    const days = Number(quickRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return orders.filter((order) => {
      const createdAt = parseValidDate(order.created_at);
      return createdAt ? createdAt >= startDate : false;
    });
  }, [filterMode, orders, quickRange, safeEndDate, safeSelectedDay, safeSelectedMonth, safeSelectedYear, safeStartDate]);

  const activeRangeLabel = getRangeLabel({
    filterMode,
    quickRange,
    selectedMonth: safeSelectedMonth,
    startDate: filterMode === "day" ? safeSelectedDay : filterMode === "year" ? safeSelectedYear : safeStartDate,
    endDate: safeEndDate,
  });
  const chartYear = filterMode === "month"
    ? Number(safeSelectedMonth.split("-")[0]) || new Date().getFullYear()
    : filterMode === "year"
      ? Number(safeSelectedYear) || new Date().getFullYear()
      : new Date().getFullYear();
  const availableYears = useMemo(() => {
    const years = [
      ...new Set(
        orders
          .map((order) => parseValidDate(order.created_at)?.getFullYear())
          .filter(Boolean)
      ),
    ];
    const currentYear = new Date().getFullYear();
    return [...new Set([...years, currentYear])].sort((first, second) => second - first);
  }, [orders]);

  const report = useMemo(() => {
    const paidOrders = filteredOrders.filter((order) => getPaymentStatus(order) === "paid");
    const revenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const paidRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const averageOrder = filteredOrders.length ? revenue / filteredOrders.length : 0;
    const paidRate = filteredOrders.length ? Math.round((paidOrders.length / filteredOrders.length) * 100) : 0;
    const customers = users.filter((user) => user.role !== "admin");

    return {
      revenue,
      paidRevenue,
      averageOrder,
      paidRate,
      orderCount: filteredOrders.length,
      paidCount: paidOrders.length,
      customerCount: customers.length,
      productCount: products.length,
    };
  }, [filteredOrders, products.length, users]);

  const monthlyRevenue = useMemo(() => {
    const rows = monthLabels.map((label, index) => ({
      label,
      key: `${chartYear}-${String(index + 1).padStart(2, "0")}`,
      revenue: 0,
      orders: 0,
    }));

    filteredOrders.forEach((order) => {
      const key = getMonthKey(order.created_at);
      const row = rows.find((item) => item.key === key);
      if (row) {
        row.revenue += Number(order.total_price || 0);
        row.orders += 1;
      }
    });

    return rows;
  }, [chartYear, filteredOrders]);

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue), 1);

  const statusSummary = Object.entries(statusLabels).map(([status, label]) => ({
    status,
    label,
    count: filteredOrders.filter((order) => order.status === status).length,
  }));

  const paymentSummary = Object.entries(paymentLabels).map(([status, label]) => ({
    status,
    label,
    count: filteredOrders.filter((order) => getPaymentStatus(order) === status).length,
  })).filter((item) => item.count > 0 || ["paid", "unpaid"].includes(item.status));

  const topProducts = useMemo(() => {
    const map = new Map();

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const current = map.get(item.product_id) || {
          id: item.product_id,
          name: item.product?.name || "Sản phẩm đã xóa",
          image: item.product?.image,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += Number(item.quantity || 0);
        current.revenue += Number(item.price || item.product?.price || 0) * Number(item.quantity || 0);
        map.set(item.product_id, current);
      });
    });

    return [...map.values()].sort((first, second) => second.revenue - first.revenue).slice(0, 5);
  }, [filteredOrders]);

  const lowStockProducts = useMemo(
    () => [...products].filter((product) => Number(product.stock) <= 10).sort((first, second) => Number(first.stock) - Number(second.stock)).slice(0, 6),
    [products]
  );

  try {
    return (
      <section className="admin-report-page">
        <div className="admin-report-heading">
          <div>
            <p className="admin-home-kicker">Dolia Reports</p>
            <h1>Báo cáo cửa hàng</h1>
            <span>{loading ? "Đang tổng hợp dữ liệu..." : `${filteredOrders.length} đơn hàng trong phạm vi đã chọn`}</span>
          </div>
          <div className="admin-report-actions">
            <select value={filterMode} onChange={(event) => handleFilterModeChange(event.target.value)}>
              <option value="quick">Lọc nhanh</option>
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
              <option value="custom">Tự chọn ngày</option>
            </select>
          </div>
        </div>

        <div className="admin-report-filter-card">
          {filterMode === "quick" && (
            <label>
              Phạm vi
              <select value={quickRange} onChange={(event) => setQuickRange(event.target.value)}>
                <option value="all">Tất cả thời gian</option>
                <option value="7">7 ngày gần đây</option>
                <option value="30">30 ngày gần đây</option>
                <option value="90">90 ngày gần đây</option>
              </select>
            </label>
          )}

          {filterMode === "month" && (
            <>
              <label>
                Chọn năm
                <select
                  value={safeSelectedMonth.split("-")[0]}
                  onChange={(event) => {
                    const month = safeSelectedMonth.split("-")[1] || "01";
                    setSelectedMonth(`${event.target.value}-${month}`);
                  }}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </label>
              <label>
                Chọn tháng
                <input type="month" value={safeSelectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
              </label>
            </>
          )}

          {filterMode === "day" && (
            <label>
              Chọn ngày
              <input type="date" value={safeSelectedDay} onChange={(event) => setSelectedDay(event.target.value)} />
            </label>
          )}

          {filterMode === "year" && (
            <label>
              Chọn năm
              <select value={safeSelectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
          )}

          {filterMode === "custom" && (
            <>
              <label>
                Từ ngày
                <input type="date" value={safeStartDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              <label>
                Đến ngày
                <input type="date" value={safeEndDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
            </>
          )}

          <div>
            <span>Phạm vi xuất: {activeRangeLabel}</span>
            <button type="button" onClick={() => downloadCsv(filteredOrders, activeRangeLabel)}>
              <Icon name="upload" /> Xuất chi tiết CSV
            </button>
          </div>
        </div>

        <div className="admin-report-kpis">
          <article>
            <span>Doanh thu ghi nhận</span>
            <strong>{formatCurrency(report.revenue)}</strong>
            <small>{report.orderCount} đơn hàng</small>
          </article>
          <article>
            <span>Đã thanh toán</span>
            <strong>{formatCurrency(report.paidRevenue)}</strong>
            <small>{report.paidCount} giao dịch thành công</small>
          </article>
          <article>
            <span>Giá trị trung bình</span>
            <strong>{formatCurrency(report.averageOrder)}</strong>
            <small>AOV theo đơn trong kỳ</small>
          </article>
          <article>
            <span>Tỷ lệ thanh toán</span>
            <strong>{report.paidRate}%</strong>
            <small>{report.customerCount} khách hàng</small>
          </article>
        </div>

        <div className="admin-report-grid">
          <section className="admin-report-panel admin-report-chart">
            <div className="admin-report-panel-head">
              <div>
                <h2>Doanh thu theo tháng</h2>
                <span>Năm {chartYear}</span>
              </div>
              <strong>{formatCurrency(report.revenue)}</strong>
            </div>
            <div className="admin-report-bars">
              {monthlyRevenue.map((item) => (
                <div key={item.key} className="admin-report-bar">
                  <span>{formatCurrency(item.revenue)}</span>
                  <i style={{ height: `${Math.max((item.revenue / maxMonthlyRevenue) * 210, item.revenue ? 30 : 10)}px` }} />
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-report-panel">
            <div className="admin-report-panel-head">
              <h2>Thanh toán</h2>
            </div>
            <div className="admin-report-list">
              {paymentSummary.map((item) => (
                <article key={item.status}>
                  <span className={`dashboard-payment-status ${item.status}`}>{item.label}</span>
                  <strong>{item.count}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-report-panel">
            <div className="admin-report-panel-head">
              <h2>Trạng thái đơn</h2>
            </div>
            <div className="admin-report-list">
              {statusSummary.map((item) => (
                <article key={item.status}>
                  <span className={`dashboard-status ${item.status}`}>{item.label}</span>
                  <strong>{item.count}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-report-panel admin-report-wide">
            <div className="admin-report-panel-head">
              <div>
                <h2>Sản phẩm tạo doanh thu</h2>
                <span>Top theo doanh thu trong kỳ</span>
              </div>
            </div>
            <div className="admin-report-products">
              {topProducts.length ? (
                topProducts.map((product) => (
                  <article key={product.id}>
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80"}
                      alt={product.name}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.quantity} sản phẩm đã bán</span>
                    </div>
                    <b>{formatCurrency(product.revenue)}</b>
                  </article>
                ))
              ) : (
                <p className="admin-report-empty">Chưa có sản phẩm phát sinh doanh thu trong kỳ này.</p>
              )}
            </div>
          </section>

          <section className="admin-report-panel">
            <div className="admin-report-panel-head">
              <h2>Cảnh báo tồn kho</h2>
            </div>
            <div className="admin-report-stock">
              {lowStockProducts.length ? (
                lowStockProducts.map((product) => (
                  <article key={product.id}>
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80"}
                      alt={product.name}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.stock} còn lại</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="admin-report-empty">Tồn kho đang ổn định.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    );
  } catch (error) {
    console.error("ReportManagement render failed:", error);
    return (
      <section className="admin-report-page">
        <div className="admin-report-panel">
          <div className="admin-report-panel-head">
            <h2>Không thể hiển thị báo cáo</h2>
          </div>
          <p className="admin-report-empty">Đã có lỗi khi áp dụng bộ lọc. Hãy thử tải lại trang hoặc chọn lại phạm vi thời gian.</p>
        </div>
      </section>
    );
  }
}

export default ReportManagement;
