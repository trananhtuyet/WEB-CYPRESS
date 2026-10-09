import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { getAdminOrders } from "../../services/orderService";
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

const getCustomerCode = (id) => `KH${String(id).padStart(3, "0")}`;

const getCustomerStatus = (customer) => {
  if (customer.role === "admin") return "Khóa";
  if (customer.orderCount === 0) return "Chờ Xử Lý";
  return "Hoạt Động";
};

const getStatusClass = (status) => {
  if (status === "Hoạt Động") return "active";
  if (status === "Chờ Xử Lý") return "pending";
  return "locked";
};

const getAgeGroup = (id) => {
  const groups = ["<20", "20-30", "31-40", ">40"];
  return groups[id % groups.length];
};

const customerPageSize = 10;

function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  useEffect(() => {
    const loadData = async () => {
      const [userData, orderData] = await Promise.all([getUsers(), getAdminOrders()]);
      setUsers(userData);
      setOrders(orderData);
    };

    loadData().catch(() => {
      setUsers([]);
      setOrders([]);
    });
  }, []);

  const customers = useMemo(() => {
    const orderSummary = orders.reduce((summary, order) => {
      const userId = order.user?.id || order.user_id;
      if (!userId) return summary;

      const current = summary[userId] || { orderCount: 0, totalSpent: 0 };
      summary[userId] = {
        orderCount: current.orderCount + 1,
        totalSpent: current.totalSpent + Number(order.total_price || 0),
      };
      return summary;
    }, {});

    return users.map((user) => {
      const summary = orderSummary[user.id] || { orderCount: 0, totalSpent: 0 };
      return {
        ...user,
        orderCount: summary.orderCount,
        totalSpent: summary.totalSpent,
        ageGroup: getAgeGroup(user.id),
      };
    });
  }, [orders, users]);

  const visibleCustomers = customers.filter((customer) => customer.role !== "admin");
  const searchableCustomers = visibleCustomers.length ? visibleCustomers : customers;
  const tableCustomers = useMemo(() => {
    if (!search) return searchableCustomers;

    return searchableCustomers.filter((customer) => {
      const haystack = [
        getCustomerCode(customer.id),
        customer.name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [search, searchableCustomers]);

  const totalCustomerPages = Math.max(1, Math.ceil(tableCustomers.length / customerPageSize));
  const displayCustomers = tableCustomers.slice((page - 1) * customerPageSize, page * customerPageSize);
  const customerPageNumbers = Array.from({ length: Math.min(totalCustomerPages, 5) }, (_, index) => {
    const start = Math.min(Math.max(page - 2, 1), Math.max(totalCustomerPages - 4, 1));
    return start + index;
  }).filter((pageNumber) => pageNumber <= totalCustomerPages);

  const stats = useMemo(() => {
    const totalCustomers = visibleCustomers.length || customers.length;
    const newCustomers = tableCustomers.filter((customer) => {
      if (!customer.created_at) return true;
      const createdAt = new Date(customer.created_at);
      const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;
    const totalRevenue = tableCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const totalOrders = tableCustomers.reduce((sum, customer) => sum + customer.orderCount, 0);
    const repeatCustomers = tableCustomers.filter((customer) => customer.orderCount > 1).length;

    return [
      { label: "Tổng khách hàng", value: totalCustomers, change: "+15%", icon: "users" },
      { label: "Khách hàng mới (tháng)", value: newCustomers, change: "+22%", icon: "users" },
      {
        label: "Giá trị trung bình (AOV)",
        value: formatCurrency(totalOrders ? totalRevenue / totalOrders : 0),
        change: "+10%",
        icon: "money",
      },
      {
        label: "Tỷ lệ quay lại",
        value: `${tableCustomers.length ? Math.round((repeatCustomers / tableCustomers.length) * 100) : 0}%`,
        change: "+5%",
        icon: "repeat",
      },
    ];
  }, [customers, tableCustomers, visibleCustomers.length]);

  const topCustomers = [...tableCustomers]
    .sort((first, second) => second.totalSpent - first.totalSpent)
    .slice(0, 4);

  const ageGroups = ["<20", "20-30", "31-40", ">40"].map((group) => ({
    group,
    count: tableCustomers.filter((customer) => customer.ageGroup === group).length,
  }));

  const maxAgeCount = Math.max(...ageGroups.map((group) => group.count), 1);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <section className="customer-admin-page">
      <div className="customer-admin-heading">
        <h1>Bảng Điều Khiển Khách Hàng</h1>
      </div>

      <div className="customer-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="customer-stat-card">
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>| {stat.change}</small>
            </div>
            <i><Icon name={stat.icon} /></i>
          </article>
        ))}
      </div>

      <div className="customer-content-grid">
        <section className="customer-panel">
          <div className="customer-panel-head">
            <h2>Quản Lý Khách Hàng</h2>
            <label className="product-admin-search">
              <input
                type="search"
                placeholder="Tìm theo mã KH, tên, email, số điện thoại..."
                value={searchParams.get("search") || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchParams((current) => {
                    const next = new URLSearchParams(current);
                    if (value) {
                      next.set("search", value);
                    } else {
                      next.delete("search");
                    }
                    return next;
                  });
                }}
              />
              <span>⌕</span>
            </label>
          </div>

          <div className="customer-table-wrap">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Mã KH</th>
                  <th>Tên Khách Hàng</th>
                  <th>Email</th>
                  <th>Số Điện Thoại</th>
                  <th>Ngày Đăng Ký</th>
                  <th>Tổng Chi Tiêu</th>
                  <th>Đơn Hàng</th>
                  <th>Tình Trạng</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {displayCustomers.map((customer) => {
                  const status = getCustomerStatus(customer);
                  return (
                    <tr key={customer.id}>
                      <td>{getCustomerCode(customer.id)}</td>
                      <td>
                        <div className="customer-name-cell">
                          <span>{customer.name?.charAt(0) || "U"}</span>
                          <strong>{customer.name}</strong>
                        </div>
                      </td>
                      <td>{customer.email}</td>
                      <td>{customer.phone || "-"}</td>
                      <td>{formatDate(customer.created_at)}</td>
                      <td>{formatCurrency(customer.totalSpent)}</td>
                      <td>{customer.orderCount}</td>
                      <td>
                        <span className={`customer-status ${getStatusClass(status)}`}>{status}</span>
                      </td>
                      <td>
                        <div className="customer-actions">
                          <button type="button"><Icon name="eye" /> Xem</button>
                          <button type="button"><Icon name="edit" /> Sửa</button>
                          <a href={`mailto:${customer.email}`}><Icon name="mail" /> Gửi Mail</a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="customer-footer">
            <span>Trang {page}/{totalCustomerPages}</span>
            <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1}>
              ‹ Pre
            </button>
            {customerPageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={pageNumber === page ? "active" : ""}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(current + 1, totalCustomerPages))}
              disabled={page >= totalCustomerPages}
            >
              Next ›
            </button>
            <button type="button" className="customer-add-button">
              Thêm Khách Hàng Mới
            </button>
            <button type="button"><Icon name="upload" /> Xuất File</button>
          </div>
        </section>

        <aside className="customer-side-stack">
          <section className="customer-panel">
            <div className="customer-panel-head">
              <h2>Khách Hàng Thân Thiết</h2>
            </div>
            <table className="customer-loyal-table">
              <thead>
                <tr>
                  <th>TOP</th>
                  <th>Tên Khách Hàng</th>
                  <th>Tổng Chi Tiêu</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="customer-name-cell compact">
                        <span>{customer.name?.charAt(0) || "U"}</span>
                        <strong>{customer.name}</strong>
                      </div>
                    </td>
                    <td>{formatCurrency(customer.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="customer-panel">
            <div className="customer-panel-head">
              <h2>Phân Phối Độ Tuổi</h2>
            </div>
            <div className="customer-age-chart">
              {ageGroups.map((item) => (
                <div key={item.group} className="customer-age-column">
                  <span>{item.count}</span>
                  <div style={{ height: `${Math.max((item.count / maxAgeCount) * 128, 12)}px` }} />
                  <small>{item.group}</small>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

export default UserManagement;
