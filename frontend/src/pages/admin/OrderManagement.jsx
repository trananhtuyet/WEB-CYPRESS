import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { getAdminOrders, updateOrder, updateOrderStatus } from "../../services/orderService";
import { confirmOrderPayment } from "../../services/paymentService";
import { getProducts } from "../../services/productService";
import { getUsers } from "../../services/userService";
import { useToast } from "../../hooks/useToast";

const statuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const statusLabels = {
  pending: "Đang xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Hủy bỏ",
};

const paymentStatusLabels = {
  pending: "Chờ thanh toán",
  processing: "Đang xử lý",
  paid: "Đã thanh toán",
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
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
};

const getOrderProducts = (order) => {
  const names = (order.items || [])
    .map((item) => item.product?.name)
    .filter(Boolean)
    .slice(0, 2);

  return names.length ? names.join(", ") : "Áo sơ mi nam x2";
};

const getOrderCode = (id) => `DH${String(id).padStart(3, "0")}`;

const getOrderItemTotal = (item) => Number(item.price || item.product?.price || 0) * Number(item.quantity || 0);

const getPaymentStatus = (order) => order.paymentTransaction?.status || "unpaid";

const getPaymentGatewayLabel = (order) => {
  const gateway = order.paymentTransaction?.gateway;
  if (gateway === "mockwallet") return "Ví điện tử mô phỏng";
  if (gateway === "zalopay") return "ZaloPay";
  return "COD / chuyển khoản";
};

const orderPageSize = 7;

const clothingFallback = [
  {
    id: "fallback-1",
    name: "Giày Nike Air Max",
    price: 1250000,
    stock: 150,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "fallback-2",
    name: "Áo Thun Uniqlo",
    price: 890000,
    stock: 120,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "fallback-3",
    name: "Quần Tây Slim Fit",
    price: 980000,
    stock: 95,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=160&q=80",
  },
];

function OrderManagement() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    status: "pending",
  });
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [savingPaymentOrderId, setSavingPaymentOrderId] = useState(null);
  const [page, setPage] = useState(1);
  const previousPaymentStatusesRef = useRef({});
  const hasLoadedPaymentsRef = useRef(false);
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  const syncPaymentNotifications = (orderData) => {
    const previousStatuses = previousPaymentStatusesRef.current;
    const nextStatuses = {};

    orderData.forEach((order) => {
      const paymentStatus = getPaymentStatus(order);
      nextStatuses[order.id] = paymentStatus;

      if (
        hasLoadedPaymentsRef.current &&
        previousStatuses[order.id] &&
        previousStatuses[order.id] !== "paid" &&
        paymentStatus === "paid"
      ) {
        showToast(`Đơn ${getOrderCode(order.id)} đã thanh toán thành công`);
      }
    });

    previousPaymentStatusesRef.current = nextStatuses;
    hasLoadedPaymentsRef.current = true;
  };

  const loadOrders = async () => {
    const data = await getAdminOrders();
    syncPaymentNotifications(data);
    setOrders(data);
    return data;
  };

  const replaceOrder = (updatedOrder) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timer;

    const loadData = async () => {
      const [, productData, userData] = await Promise.all([
        loadOrders(),
        getProducts({ page: 1, limit: 8 }),
        getUsers(),
      ]);

      if (!mounted) return;
      setProducts(productData.products || []);
      setUsers(userData);
    };

    loadData().catch(() => {
      if (!mounted) return;
      setOrders([]);
      setProducts([]);
      setUsers([]);
    });

    timer = window.setInterval(() => {
      loadOrders().catch(() => {});
    }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!selectedOrder) return undefined;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOrder]);

  const handleStatusChange = async (id, status) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      replaceOrder(updatedOrder);
      showToast("Đã lưu tình trạng đơn hàng");
    } catch (error) {
      showToast(error?.response?.data?.message || "Không thể lưu tình trạng đơn hàng", "error");
    }
  };

  const handleConfirmPayment = async (orderId) => {
    setSavingPaymentOrderId(orderId);
    try {
      const updatedOrder = await confirmOrderPayment(orderId);
      replaceOrder(updatedOrder);
      showToast("Đã xác nhận thanh toán");
    } catch (error) {
      showToast(error?.response?.data?.message || "Không thể xác nhận thanh toán", "error");
    } finally {
      setSavingPaymentOrderId(null);
    }
  };

  const openOrderDetail = (order, editing = false) => {
    setSelectedOrder(order);
    setIsEditingOrder(editing);
    setOrderForm({
      status: order.status || "pending",
    });
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setIsEditingOrder(false);
  };

  const handleOrderFormChange = (field, value) => {
    setOrderForm((current) => ({ ...current, [field]: value }));
  };

  const handleOrderSave = async (event) => {
    event.preventDefault();
    if (!selectedOrder) return;

    setIsSavingOrder(true);
    try {
      const updatedOrder = await updateOrder(selectedOrder.id, {
        status: orderForm.status,
      });
      showToast("Đã cập nhật đơn hàng");
      setSelectedOrder(updatedOrder);
      setOrderForm({
        status: updatedOrder.status || "pending",
      });
      replaceOrder(updatedOrder);
      setIsEditingOrder(false);
      await loadOrders();
    } catch (error) {
      showToast(error?.response?.data?.message || "Không thể cập nhật đơn hàng", "error");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);

    return [
      { label: "Tổng đơn hàng", value: orders.length, change: "+15%", icon: "orders" },
      { label: "Tổng doanh thu", value: formatCurrency(revenue), change: "+10.2%", icon: "money" },
      { label: "Sản phẩm mới", value: products.length, change: "+5%", icon: "products" },
      { label: "Khách hàng mới", value: users.length, change: "+22%", icon: "users" },
    ];
  }, [orders, products.length, users.length]);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;

    return orders.filter((order) => {
      const haystack = [
        getOrderCode(order.id),
        order.user?.name,
        order.user?.email,
        order.address,
        order.status,
        ...((order.items || []).map((item) => item.product?.name)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [orders, search]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / orderPageSize));
  const displayOrders = filteredOrders.slice((page - 1) * orderPageSize, page * orderPageSize);
  const orderPageNumbers = Array.from({ length: Math.min(totalOrderPages, 5) }, (_, index) => {
    const start = Math.min(Math.max(page - 2, 1), Math.max(totalOrderPages - 4, 1));
    return start + index;
  }).filter((pageNumber) => pageNumber <= totalOrderPages);
  const displayProducts = products.length ? products.slice(0, 3) : clothingFallback;
  const displayUsers = users.filter((user) => user.role !== "admin").slice(0, 2);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <section className="admin-dashboard">
      <div className="admin-page-heading">
        <h1>Bảng Điều Khiển & Quản Lý</h1>
      </div>

      <div className="dashboard-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="dashboard-stat-card">
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>| {stat.change}</small>
            </div>
            <i><Icon name={stat.icon} /></i>
          </article>
        ))}
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel dashboard-orders-panel">
          <div className="dashboard-panel-head">
            <h2>Quản Lý Đơn Hàng</h2>
            <label className="product-admin-search">
              <input
                type="search"
                placeholder="Tìm theo mã đơn, khách hàng, sản phẩm..."
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

          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Ngày Đặt</th>
                  <th>Sản Phẩm</th>
                  <th>Tổng Tiền</th>
                  <th>Thanh Toán</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.length ? (
                  displayOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{getOrderCode(order.id)}</td>
                      <td>{order.user?.name || "Khách lẻ"}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>{getOrderProducts(order)}</td>
                      <td>{formatCurrency(Number(order.total_price))}</td>
                      <td>
                        <span className={`dashboard-payment-status ${getPaymentStatus(order)}`}>
                          {paymentStatusLabels[getPaymentStatus(order)] || getPaymentStatus(order)}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`dashboard-status-select ${order.status}`}
                          value={order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          aria-label="Cập nhật tình trạng đơn hàng"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="dashboard-actions">
                          <button type="button" onClick={() => openOrderDetail(order)}>
                            <Icon name="eye" /> Xem
                          </button>
                          <button type="button" onClick={() => openOrderDetail(order, true)}>
                            <Icon name="edit" /> Sửa
                          </button>
                          {getPaymentStatus(order) !== "paid" && order.paymentTransaction && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={savingPaymentOrderId === order.id}
                            >
                              <Icon name="money" /> Đã nhận tiền
                            </button>
                          )}
                          <button type="button" aria-label="Xóa"><Icon name="delete" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>DH095</td>
                    <td>
                      <strong>Lê Thị Bình</strong>
                      <span className="dashboard-muted-cell">demo@example.com</span>
                    </td>
                    <td>14/05/2024</td>
                    <td>Áo Sơ Mi Nam x2</td>
                    <td>{formatCurrency(1250000)}</td>
                    <td>
                      <span className="dashboard-payment-status unpaid">Chưa thanh toán</span>
                    </td>
                    <td>
                      <span className="dashboard-status pending">Đang xử lý</span>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <button type="button"><Icon name="eye" /> Xem</button>
                        <button type="button"><Icon name="edit" /> Sửa</button>
                        <button type="button" aria-label="Xóa"><Icon name="delete" /></button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="dashboard-table-footer">
            <span>Trang {page}/{totalOrderPages}</span>
            <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1}>
              ‹ Pre
            </button>
            {orderPageNumbers.map((pageNumber) => (
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
              onClick={() => setPage((current) => Math.min(current + 1, totalOrderPages))}
              disabled={page >= totalOrderPages}
            >
              Next ›
            </button>
            <button type="button" className="dashboard-add-order">
              Thêm Đơn Hàng Mới
            </button>
            <button type="button"><Icon name="upload" /> Xuất File</button>
          </div>
        </section>

        <aside className="dashboard-side-stack">
          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>Quản Lý Sản Phẩm Bán Chạy</h2>
            </div>
            <div className="dashboard-product-list">
              {displayProducts.map((product, index) => (
                <article key={product.id} className="dashboard-product-item">
                  <img src={product.image || clothingFallback[index % clothingFallback.length].image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{formatCurrency(Number(product.price))}</span>
                    <small>{product.stock || 0} còn</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>Quản Lý Khách Hàng Mới</h2>
            </div>
            <div className="dashboard-customer-list">
              {displayUsers.length ? (
                displayUsers.map((user) => (
                  <article key={user.id} className="dashboard-customer-item">
                    <div className="dashboard-customer-avatar">{user.name?.charAt(0) || "U"}</div>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <small>Ngày Join: {formatDate(user.created_at)}</small>
                    </div>
                  </article>
                ))
              ) : (
                <article className="dashboard-customer-item">
                  <div className="dashboard-customer-avatar">L</div>
                  <div>
                    <strong>Lê Thị Bình</strong>
                    <span>lethibinh@gmail.com</span>
                    <small>Ngày Join: 15/05/2024</small>
                  </div>
                </article>
              )}
            </div>
          </section>
        </aside>
      </div>

      {selectedOrder && (
        <div className="order-admin-drawer" role="dialog" aria-modal="true">
          <div className="order-admin-panel">
            <div className="order-admin-head">
              <div>
                <span>Chi tiết đơn hàng</span>
                <h2>{getOrderCode(selectedOrder.id)}</h2>
              </div>
              <button type="button" onClick={closeOrderDetail} aria-label="Đóng">
                ×
              </button>
            </div>

            <div className="order-admin-content">
              <div className="order-admin-summary">
                <article>
                  <span>Khách hàng</span>
                  <strong>{selectedOrder.user?.name || "Khách lẻ"}</strong>
                  <small>{selectedOrder.user?.email || "Không có email"}</small>
                </article>
                <article>
                  <span>Ngày đặt</span>
                  <strong>{formatDate(selectedOrder.created_at)}</strong>
                  <small>{selectedOrder.items?.length || 0} sản phẩm</small>
                </article>
                <article>
                  <span>Trạng thái</span>
                  <strong>{statusLabels[selectedOrder.status] || selectedOrder.status}</strong>
                  <small>{formatCurrency(Number(selectedOrder.total_price))}</small>
                </article>
                <article>
                  <span>Thanh toán</span>
                  <strong>{paymentStatusLabels[getPaymentStatus(selectedOrder)] || getPaymentStatus(selectedOrder)}</strong>
                  <small>{getPaymentGatewayLabel(selectedOrder)}</small>
                </article>
              </div>

              {isEditingOrder ? (
                <form className="order-admin-form" onSubmit={handleOrderSave}>
                  <label>
                    Trạng thái đơn
                    <select
                      value={orderForm.status}
                      onChange={(event) => handleOrderFormChange("status", event.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="order-admin-form-actions">
                    <button type="button" onClick={() => setIsEditingOrder(false)}>
                      Hủy
                    </button>
                    <button type="submit" disabled={isSavingOrder}>
                      {isSavingOrder ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="order-admin-address">
                    <span>Thông tin giao hàng</span>
                    <p>{selectedOrder.address || "Chưa có địa chỉ giao hàng"}</p>
                  </div>

                  <div className="order-admin-products">
                    <div className="order-admin-section-title">
                      <span>Sản phẩm trong đơn</span>
                      <strong>{formatCurrency(Number(selectedOrder.total_price))}</strong>
                    </div>
                    <div className="order-admin-products-body">
                      {(selectedOrder.items || []).length ? (
                        selectedOrder.items.map((item) => (
                          <article key={item.id || `${item.product_id}-${item.quantity}`}>
                            <img src={item.product?.image || clothingFallback[0].image} alt={item.product?.name || "Sản phẩm"} />
                            <div>
                              <strong>{item.product?.name || "Sản phẩm đã xóa"}</strong>
                              <span>
                                SL {item.quantity} · {formatCurrency(Number(item.price || item.product?.price))}
                              </span>
                            </div>
                            <b>{formatCurrency(getOrderItemTotal(item))}</b>
                          </article>
                        ))
                      ) : (
                        <p className="order-admin-empty">Đơn hàng này chưa có dữ liệu sản phẩm.</p>
                      )}
                    </div>
                  </div>

                  <div className="order-admin-form-actions">
                    <button type="button" onClick={closeOrderDetail}>
                      Đóng
                    </button>
                    {getPaymentStatus(selectedOrder) !== "paid" && selectedOrder.paymentTransaction && (
                      <button
                        type="button"
                        onClick={() => handleConfirmPayment(selectedOrder.id)}
                        disabled={savingPaymentOrderId === selectedOrder.id}
                      >
                        {savingPaymentOrderId === selectedOrder.id ? "Đang xác nhận..." : "Xác nhận đã nhận tiền"}
                      </button>
                    )}
                    <button type="button" onClick={() => setIsEditingOrder(true)}>
                      Sửa đơn hàng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrderManagement;
