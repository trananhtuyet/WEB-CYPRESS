import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { getUserOrders } from "../services/orderService";
import { createBankQrUrl, getPaymentConfig } from "../utils/paymentConfig";
import { useToast } from "../hooks/useToast";

const statusLabels = {
  all: "Tất cả",
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const statusSteps = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const progressSteps = ["pending", "confirmed", "shipping", "delivered"];

const paymentStatusLabels = {
  pending: "Chờ thanh toán",
  processing: "Đang xử lý",
  paid: "Đã thanh toán",
  failed: "Thanh toán lỗi",
  cancelled: "Đã hủy",
  unpaid: "Chưa thanh toán",
};

const paymentGatewayLabels = {
  bank_transfer: "Chuyển khoản ngân hàng",
  cod: "Thanh toán khi nhận hàng",
  mockwallet: "Ví điện tử mô phỏng",
  zalopay: "ZaloPay",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

function OrderHistory() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [qrPreview, setQrPreview] = useState(null);
  const bankConfig = useMemo(() => getPaymentConfig(), []);
  const previousPaymentStatusesRef = useRef({});
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let timer;

    const loadOrders = async () => {
      try {
        const data = await getUserOrders();
        if (!mounted) return;

        const previousStatuses = previousPaymentStatusesRef.current;
        const nextStatuses = {};

        data.forEach((order) => {
          const paymentStatus = order.paymentTransaction?.status || "unpaid";
          nextStatuses[order.id] = paymentStatus;

          if (
            hasLoadedRef.current &&
            previousStatuses[order.id] &&
            previousStatuses[order.id] !== "paid" &&
            paymentStatus === "paid"
          ) {
            showToast(`Đơn DH${String(order.id).padStart(4, "0")} đã thanh toán thành công`);
          }
        });

        previousPaymentStatusesRef.current = nextStatuses;
        hasLoadedRef.current = true;
        setOrders(data);
      } catch {
        if (mounted) {
          setOrders([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();
    timer = window.setInterval(loadOrders, 10000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [showToast]);

  useEffect(() => {
    if (!qrPreview) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setQrPreview(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [qrPreview]);

  const summary = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
    const deliveredOrders = orders.filter((order) => order.status === "delivered").length;

    return { totalSpent, activeOrders, deliveredOrders };
  }, [orders]);

  const filteredOrders = activeStatus === "all" ? orders : orders.filter((order) => order.status === activeStatus);

  return (
    <section className="fashion-orders-page">
      <div className="fashion-orders-hero">
        <div>
          <p>Dolia Orders</p>
          <h1>Đơn hàng của bạn</h1>
          <span>Theo dõi trạng thái xử lý, sản phẩm đã đặt và tổng thanh toán trong một nơi.</span>
        </div>
        <aside>
          <Icon name="orders" size={30} />
          <strong>{orders.length}</strong>
          <span>Đơn đã đặt</span>
        </aside>
      </div>

      <div className="fashion-orders-stats">
        <article>
          <span>Tổng chi tiêu</span>
          <strong>{formatCurrency(summary.totalSpent)}</strong>
        </article>
        <article>
          <span>Đang xử lý</span>
          <strong>{summary.activeOrders}</strong>
        </article>
        <article>
          <span>Đã hoàn tất</span>
          <strong>{summary.deliveredOrders}</strong>
        </article>
      </div>

      <div className="fashion-orders-tabs">
        {Object.entries(statusLabels).map(([status, label]) => (
          <button
            key={status}
            type="button"
            className={activeStatus === status ? "active" : ""}
            onClick={() => setActiveStatus(status)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="fashion-orders-empty">Đang tải đơn hàng...</div>
      ) : filteredOrders.length ? (
        <div className="fashion-orders-list">
          {filteredOrders.map((order) => {
            const currentStep = progressSteps.indexOf(order.status);
            const isCancelled = order.status === "cancelled";
            const paymentTransaction = order.paymentTransaction;
            const paymentStatus = paymentTransaction?.status || "unpaid";
            const isBankTransfer = paymentTransaction?.gateway === "bank_transfer";
            const bankQrUrl = isBankTransfer
              ? createBankQrUrl({
                  amount: Number(order.total_price),
                  orderCode: paymentTransaction.transactionCode || paymentTransaction.transaction_code,
                  config: bankConfig,
                })
              : "";

            return (
              <article key={order.id} className="fashion-order-card">
                <header>
                  <div>
                    <span>DH{String(order.id).padStart(4, "0")}</span>
                    <h2>{statusLabels[order.status]}</h2>
                    <small>{formatDate(order.created_at)}</small>
                  </div>
                  <strong>{formatCurrency(Number(order.total_price))}</strong>
                </header>

                <div className={`fashion-order-timeline ${isCancelled ? "cancelled" : ""}`}>
                  {statusSteps.map((step, index) => {
                    const isRegularStep = progressSteps.includes(step);
                    const isActive = isCancelled
                      ? step === "cancelled"
                      : isRegularStep && index <= currentStep;

                    return (
                      <div key={step} className={isActive ? "active" : ""}>
                        <i>{index + 1}</i>
                        <span>{statusLabels[step]}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="fashion-order-payment">
                  <div>
                    <span>Thanh toán</span>
                    <strong>{paymentStatusLabels[paymentStatus] || paymentStatus}</strong>
                    <small>
                      {paymentGatewayLabels[paymentTransaction?.gateway] || "COD / chuyển khoản"}
                      {paymentTransaction?.transaction_code ? ` · ${paymentTransaction.transaction_code}` : ""}
                    </small>
                  </div>
                  {isBankTransfer && paymentStatus !== "paid" && (
                    <div className="fashion-order-bank">
                      <button
                        type="button"
                        className="fashion-order-qr-trigger"
                        onClick={() =>
                          setQrPreview({
                            url: bankQrUrl,
                            orderCode: paymentTransaction.transaction_code,
                          })
                        }
                        aria-label={`Phóng to mã QR cho đơn ${paymentTransaction.transaction_code}`}
                      >
                        <img src={bankQrUrl} alt="QR chuyển khoản ngân hàng" />
                        <span>Nhấn để phóng to</span>
                      </button>
                      <div>
                        <strong>{bankConfig.accountName}</strong>
                        <span>{bankConfig.bankCode} · {bankConfig.accountNumber}</span>
                        <small>
                          Nội dung: {bankConfig.transferNotePrefix || "DOLIA"} {paymentTransaction.transaction_code}
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                <div className="fashion-order-products">
                  {order.items.map((item) => (
                    <Link key={item.id} to={`/products/${item.product_id}`}>
                      <img src={item.product.image} alt={item.product.name} />
                      <div>
                        <strong>{item.product.name}</strong>
                        <span>Số lượng: {item.quantity}</span>
                      </div>
                      <small>{formatCurrency(Number(item.price) * item.quantity)}</small>
                    </Link>
                  ))}
                </div>

                <footer>
                  <span>{order.address?.split("\n")[0] || "Thông tin nhận hàng đã lưu"}</span>
                  <Link to="/">Tiếp tục mua sắm</Link>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="fashion-orders-empty">
          <h2>Chưa có đơn hàng phù hợp.</h2>
          <Link to="/">Khám phá sản phẩm</Link>
        </div>
      )}

      {qrPreview && (
        <div
          className="fashion-qr-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Xem mã QR chuyển khoản"
          onClick={() => setQrPreview(null)}
        >
          <div className="fashion-qr-modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="fashion-qr-modal-close"
              onClick={() => setQrPreview(null)}
              aria-label="Đóng xem trước mã QR"
            >
              <Icon name="close" size={18} />
            </button>

            <p>Mã QR chuyển khoản</p>
            <strong>{qrPreview.orderCode}</strong>
            <img src={qrPreview.url} alt={`QR chuyển khoản đơn ${qrPreview.orderCode}`} />

            <div className="fashion-qr-modal-meta">
              <span>{bankConfig.accountName}</span>
              <small>{bankConfig.bankCode} · {bankConfig.accountNumber}</small>
            </div>

            <div className="fashion-qr-modal-actions">
              <a href={qrPreview.url} download={`qr-${qrPreview.orderCode}.png`} target="_blank" rel="noreferrer">
                Tải mã QR
              </a>
              <button type="button" onClick={() => setQrPreview(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrderHistory;
