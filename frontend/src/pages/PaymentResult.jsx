import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getPaymentTransaction } from "../services/paymentService";
import { useCart } from "../hooks/useCart";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getStoredPayment = () => {
  try {
    return JSON.parse(sessionStorage.getItem("dolia_pending_payment") || "null");
  } catch {
    return null;
  }
};

function PaymentResult() {
  const location = useLocation();
  const { refreshCart } = useCart();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const transactionCode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const storedPayment = getStoredPayment();

    return (
      params.get("apptransid") ||
      params.get("app_trans_id") ||
      params.get("transactionCode") ||
      storedPayment?.transactionCode ||
      ""
    );
  }, [location.search]);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    let timer;

    const loadPayment = async () => {
      if (!transactionCode) {
        setMessage("Không tìm thấy mã giao dịch thanh toán.");
        setLoading(false);
        return;
      }

      attempts += 1;
      try {
        const data = await getPaymentTransaction(transactionCode);
        if (!mounted) return;

        setPayment(data);
        setLoading(false);

        if (data.status === "paid") {
          sessionStorage.removeItem("dolia_pending_payment");
          sessionStorage.removeItem("dolia_checkout_product_ids");
          await refreshCart();
          return;
        }

        if (data.status === "failed" || data.status === "cancelled") {
          return;
        }

        if (attempts < 10) {
          timer = window.setTimeout(loadPayment, 2500);
        }
      } catch (error) {
        if (!mounted) return;
        setMessage(error.response?.data?.message || "Không thể kiểm tra trạng thái thanh toán.");
        setLoading(false);
      }
    };

    loadPayment();

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [transactionCode]);

  const status = payment?.status;
  const isPaid = status === "paid";
  const isPending = status === "pending" || status === "processing";

  return (
    <section className="fashion-payment-result-page">
      <div className="fashion-payment-result-card">
        <p>Dolia Payment</p>
        <h1>
          {loading
            ? "Đang kiểm tra thanh toán"
            : isPaid
              ? "Thanh toán thành công"
              : isPending
                ? "Đang chờ xác nhận"
                : "Thanh toán chưa hoàn tất"}
        </h1>
        <span>
          {message ||
            (isPaid
              ? "Đơn hàng đã được tạo sau khi ví điện tử xác nhận giao dịch."
              : isPending
                ? "Nếu bạn đã thanh toán, hệ thống sẽ cập nhật sau khi ví gửi callback."
                : "Bạn có thể quay lại giỏ hàng để thử thanh toán lại.")}
        </span>

        {payment && (
          <div className="fashion-payment-result-meta">
            <article>
              <span>Mã giao dịch</span>
              <strong>{payment.transactionCode}</strong>
            </article>
            <article>
              <span>Số tiền</span>
              <strong>{formatCurrency(payment.amount)}</strong>
            </article>
            <article>
              <span>Trạng thái</span>
              <strong>{payment.status}</strong>
            </article>
          </div>
        )}

        <div className="fashion-payment-result-actions">
          {isPaid ? <Link to="/orders">Xem đơn hàng</Link> : <Link to="/checkout">Quay lại thanh toán</Link>}
          <Link to="/">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </section>
  );
}

export default PaymentResult;
