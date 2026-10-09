import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { confirmMockWalletPayment, failMockWalletPayment, getPaymentTransaction } from "../services/paymentService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

function MockWallet() {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionCode = useMemo(() => new URLSearchParams(location.search).get("transactionCode") || "", [location.search]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!transactionCode) {
      setMessage("Không tìm thấy mã giao dịch.");
      setLoading(false);
      return;
    }

    getPaymentTransaction(transactionCode)
      .then(setPayment)
      .catch((error) => setMessage(error.response?.data?.message || "Không thể tải giao dịch."))
      .finally(() => setLoading(false));
  }, [transactionCode]);

  const handleSettle = async (status) => {
    if (!transactionCode) return;

    setSubmitting(true);
    setMessage("");

    try {
      const nextPayment = status === "paid"
        ? await confirmMockWalletPayment(transactionCode)
        : await failMockWalletPayment(transactionCode);
      setPayment(nextPayment);
      navigate(`/payment-result?transactionCode=${encodeURIComponent(transactionCode)}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể cập nhật thanh toán.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="fashion-payment-result-page">
      <div className="fashion-payment-result-card">
        <p>Dolia Wallet Simulator</p>
        <h1>Ví điện tử mô phỏng</h1>
        <span>
          {loading
            ? "Đang tải giao dịch..."
            : message || "Chọn kết quả thanh toán để mô phỏng callback từ ví điện tử."}
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
          <button type="button" onClick={() => handleSettle("paid")} disabled={submitting || loading || payment?.status !== "pending"}>
            Thanh toán thành công
          </button>
          <button type="button" onClick={() => handleSettle("failed")} disabled={submitting || loading || payment?.status !== "pending"}>
            Từ chối thanh toán
          </button>
          <Link to="/checkout">Quay lại checkout</Link>
        </div>
      </div>
    </section>
  );
}

export default MockWallet;
