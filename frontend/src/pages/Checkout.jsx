import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAddressPicker from "../components/GoogleAddressPicker";
import Icon from "../components/Icon";
import { checkoutOrder } from "../services/orderService";
import { createMockWalletOrder, createZaloPayOrder } from "../services/paymentService";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { getPaymentConfig } from "../utils/paymentConfig";
import { getActiveVouchers } from "../services/voucherService";

const paymentMethods = [
  {
    id: "mockwallet",
    name: "Ví điện tử mô phỏng",
    description: "Dùng cho demo: xác nhận giao dịch ngay trên localhost.",
  },
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng",
    description: "Kiểm tra sản phẩm trước khi thanh toán.",
  },
  {
    id: "bank",
    name: "Chuyển khoản ngân hàng",
    description: "Dolia xác nhận đơn sau khi nhận chuyển khoản.",
  },
  {
    id: "zalopay",
    name: "ZaloPay",
    description: "Cần merchant keys thật, hiện đang tắt cho demo.",
    disabled: true,
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getVoucherLabel = (voucher) =>
  ({
    percent: `Giảm ${Number(voucher.value)}%`,
    fixed: `Giảm ${formatCurrency(Number(voucher.value))}`,
    tiered: `Bậc thang ${Number(voucher.value)}%`,
    free_shipping: "Miễn phí vận chuyển",
    gift: "Quà tặng kèm",
  }[voucher.type] || voucher.name);

const getVoucherDiscount = (voucher, subtotal) => {
  if (!voucher || Number(subtotal) < Number(voucher.min_order_amount || 0)) return 0;
  let rawDiscount = 0;
  if (voucher.type === "percent" || voucher.type === "tiered") {
    rawDiscount = Math.round(Number(subtotal) * (Number(voucher.value) / 100));
  }
  if (voucher.type === "fixed") {
    rawDiscount = Number(voucher.value);
  }
  const cappedDiscount =
    voucher.max_discount_amount === null || voucher.max_discount_amount === undefined
      ? rawDiscount
      : Math.min(rawDiscount, Number(voucher.max_discount_amount));
  return Math.min(Math.max(cappedDiscount, 0), Number(subtotal));
};

function Checkout() {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [useAccountInfo, setUseAccountInfo] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("mockwallet");

  const selectedProductIds = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("dolia_checkout_product_ids");
      return stored ? JSON.parse(stored).map(Number).filter(Boolean) : [];
    } catch {
      return [];
    }
  }, []);

  const checkoutItems = useMemo(() => {
    const items = cart.items || [];
    return selectedProductIds.length
      ? items.filter((item) => selectedProductIds.includes(Number(item.product_id)))
      : items;
  }, [cart.items, selectedProductIds]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  useEffect(() => {
    getActiveVouchers()
      .then(setVouchers)
      .catch(() => setVouchers([]));
  }, []);

  const appliedVoucher = vouchers.find((voucher) => voucher.code === appliedCoupon);
  const discount = appliedVoucher ? getVoucherDiscount(appliedVoucher, subtotal) : 0;
  const total = Math.max(subtotal - discount, 0);
  const selectedPayment = paymentMethods.find((method) => method.id === paymentMethod);
  const bankConfig = useMemo(() => getPaymentConfig(), []);

  const handleUseAccountInfo = () => {
    const nextValue = !useAccountInfo;
    setUseAccountInfo(nextValue);
    if (nextValue) {
      setReceiverName(user?.name || "");
      setPhone(user?.phone || "");
      setAddress(user?.address || "");
      return;
    }

    setReceiverName("");
    setPhone("");
    setAddress("");
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setAppliedCoupon("");
      showToast("Đã bỏ mã giảm giá");
      return;
    }

    const voucher = vouchers.find((item) => item.code === code);
    if (!voucher) {
      showToast("Mã giảm giá không hợp lệ", "error");
      return;
    }

    if (Number(subtotal) < Number(voucher.min_order_amount || 0)) {
      showToast(`Đơn tối thiểu ${formatCurrency(Number(voucher.min_order_amount))} để dùng mã này`, "error");
      return;
    }

    setAppliedCoupon(code);
    showToast(`Đã áp dụng mã ${code}`);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (!checkoutItems.length) {
      showToast("Không có sản phẩm nào để thanh toán", "error");
      navigate("/cart");
      return;
    }

    if (!receiverName.trim() || !phone.trim() || !address.trim()) {
      showToast("Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ", "error");
      return;
    }

    try {
      const shippingAddress = [
        `Người nhận: ${receiverName.trim()}`,
        `Địa chỉ: ${address.trim()}`,
      ].join("\n");

      if (paymentMethod === "zalopay" || paymentMethod === "mockwallet") {
        const createWalletOrder = paymentMethod === "zalopay" ? createZaloPayOrder : createMockWalletOrder;
        const walletOrder = await createWalletOrder({
          address: shippingAddress,
          phone: phone.trim(),
          discountCode: appliedCoupon,
          selectedProductIds,
        });
        sessionStorage.setItem("dolia_pending_payment", JSON.stringify({
          gateway: paymentMethod,
          transactionCode: walletOrder.appTransId || walletOrder.transactionCode,
          amount: walletOrder.amount,
        }));
        window.location.href = walletOrder.orderUrl;
        return;
      }

      await checkoutOrder({
        address: shippingAddress,
        phone: phone.trim(),
        paymentMethod: selectedPayment?.name || paymentMethod,
        discountCode: appliedCoupon,
        selectedProductIds,
      });
      await refreshCart();
      sessionStorage.removeItem("dolia_checkout_product_ids");
      showToast("Đặt hàng thành công");
      navigate("/orders");
    } catch (error) {
      showToast(error.response?.data?.message || "Thanh toán thất bại", "error");
    }
  };

  return (
    <section className="fashion-checkout-page">
      <div className="fashion-checkout-head">
        <div>
          <p>Dolia Checkout</p>
          <h1>Thanh toán đơn hàng</h1>
        </div>
        <Link to="/cart">Quay lại giỏ hàng</Link>
      </div>

      <form className="fashion-checkout-layout" onSubmit={handleCheckout}>
        <div className="fashion-checkout-main">
          <section className="fashion-checkout-panel">
            <div className="fashion-checkout-panel-head">
              <span>01</span>
              <div>
                <p>Thông tin nhận hàng</p>
                <h2>Chọn từ tài khoản hoặc chỉnh sửa</h2>
              </div>
            </div>

            <label className="fashion-account-toggle">
              <input type="checkbox" checked={useAccountInfo} onChange={handleUseAccountInfo} />
              <span>Dùng thông tin trong tài khoản của tôi</span>
            </label>

            <div className="fashion-checkout-fields">
              <label>
                Họ tên người nhận
                <input value={receiverName} onChange={(event) => setReceiverName(event.target.value)} required />
              </label>
              <label>
                Số điện thoại
                <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </label>
              <div className="wide">
                <GoogleAddressPicker value={address} onChange={setAddress} required />
              </div>
            </div>
          </section>

          <section className="fashion-checkout-panel">
            <div className="fashion-checkout-panel-head">
              <span>02</span>
              <div>
                <p>Mã giảm giá</p>
                <h2>Áp ưu đãi cho đơn hàng</h2>
              </div>
            </div>
            <div className="fashion-coupon-row">
              <input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="Nhập mã voucher"
              />
              <button type="button" onClick={handleApplyCoupon}>
                Áp mã
              </button>
            </div>
            <div className="fashion-coupon-suggest">
              {vouchers.map((voucher) => (
                <button
                  key={voucher.id}
                  type="button"
                  className={appliedCoupon === voucher.code ? "active" : ""}
                  onClick={() => {
                    setCouponInput(voucher.code);
                    if (Number(subtotal) < Number(voucher.min_order_amount || 0)) {
                      showToast(`Đơn tối thiểu ${formatCurrency(Number(voucher.min_order_amount))} để dùng mã này`, "error");
                      return;
                    }
                    setAppliedCoupon(voucher.code);
                  }}
                >
                  <strong>{voucher.code}</strong>
                  <span>{getVoucherLabel(voucher)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="fashion-checkout-panel">
            <div className="fashion-checkout-panel-head">
              <span>03</span>
              <div>
                <p>Phương thức thanh toán</p>
                <h2>Chọn cách bạn muốn thanh toán</h2>
              </div>
            </div>
            <div className="fashion-payment-list">
              {paymentMethods.map((method) => (
                <label key={method.id} className={paymentMethod === method.id ? "active" : ""}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === method.id}
                    disabled={method.disabled}
                    onChange={() => {
                      if (!method.disabled) {
                        setPaymentMethod(method.id);
                      }
                    }}
                  />
                  <span>
                    <Icon name={method.id === "cod" ? "cart" : "money"} size={20} />
                  </span>
                  <div>
                    <strong>{method.name}</strong>
                    <small>{method.description}</small>
                  </div>
                </label>
              ))}
            </div>
            {paymentMethod === "zalopay" && (
              <div className="fashion-zalopay-box">
                <div>
                  <strong>ZaloPay Gateway</strong>
                  <span>Bấm đặt hàng để chuyển sang cổng thanh toán ZaloPay.</span>
                  <small>Đơn chỉ được tạo sau khi server nhận callback hợp lệ từ ZaloPay.</small>
                </div>
                <button type="submit">Thanh toán thật</button>
              </div>
            )}
            {paymentMethod === "mockwallet" && (
              <div className="fashion-zalopay-box">
                <div>
                  <strong>Ví điện tử mô phỏng</strong>
                  <span>Bấm thanh toán để mở màn hình ví demo.</span>
                  <small>Giao dịch vẫn được lưu, xác nhận, tạo đơn, trừ kho và xóa giỏ như luồng ví thật.</small>
                </div>
                <button type="submit">Mở ví demo</button>
              </div>
            )}
            {paymentMethod === "bank" && (
              <div className="fashion-bank-qr-box">
                <div>
                  <strong>{bankConfig.accountName}</strong>
                  <span>{bankConfig.bankCode} · {bankConfig.accountNumber}</span>
                  <small>
                    Sau khi đặt hàng, hệ thống sẽ tạo mã chuyển khoản riêng cho đơn này để bạn quét QR và đối soát.
                  </small>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="fashion-checkout-summary">
          <p>Tóm tắt thanh toán</p>
          <h2>{formatCurrency(total)}</h2>
          <div className="fashion-checkout-items">
            {checkoutItems.map((item) => (
              <article key={item.id}>
                <Link to={`/products/${item.product_id}`}>
                  <img src={item.product.image} alt={item.product.name} />
                </Link>
                <div>
                  <Link to={`/products/${item.product_id}`}>{item.product.name}</Link>
                  <span>x {item.quantity}</span>
                </div>
                <small>{formatCurrency(Number(item.product.price) * item.quantity)}</small>
              </article>
            ))}
          </div>
          <div className="fashion-checkout-total-line">
            <span>Tạm tính</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="fashion-checkout-total-line">
            <span>Giảm giá</span>
            <strong>-{formatCurrency(discount)}</strong>
          </div>
          <div className="fashion-checkout-total-line">
            <span>Vận chuyển</span>
            <strong>Miễn phí</strong>
          </div>
          <div className="fashion-checkout-final">
            <span>Cần thanh toán</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <button type="submit">Đặt hàng</button>
          <small>{selectedPayment?.name}. Đổi trả trong 7 ngày sau khi nhận hàng.</small>
        </aside>
      </form>
    </section>
  );
}

export default Checkout;
