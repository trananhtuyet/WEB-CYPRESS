import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GoogleAddressPicker from "../components/GoogleAddressPicker";
import Icon from "../components/Icon";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getUserOrders } from "../services/orderService";
import { updateProfile } from "../services/userService";

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
  }).format(new Date(value));
};

const getMonthKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

function Account() {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    avatar: null,
  });

  useEffect(() => {
    getUserOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      address: user?.address || "",
      avatar: null,
    });
    setAvatarPreview(user?.avatar || "");
  }, [user]);

  const spending = useMemo(() => {
    const validOrders = orders.filter((order) => order.status !== "cancelled");
    const paidOrders = validOrders.filter((order) => order.paymentTransaction?.status === "paid" || order.status === "delivered");
    const totalSpent = validOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const paidSpent = paidOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
    const currentMonth = getMonthKey(new Date());
    const currentMonthSpent = validOrders
      .filter((order) => getMonthKey(order.created_at) === currentMonth)
      .reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    const monthlyMap = validOrders.reduce((result, order) => {
      const key = getMonthKey(order.created_at);
      result[key] = (result[key] || 0) + Number(order.total_price || 0);
      return result;
    }, {});
    const monthly = Object.entries(monthlyMap)
      .sort(([first], [second]) => second.localeCompare(first))
      .slice(0, 5)
      .reverse();
    const maxMonthValue = Math.max(...monthly.map(([, value]) => value), 1);

    return {
      currentMonthSpent,
      deliveredOrders,
      maxMonthValue,
      monthly,
      paidSpent,
      totalOrders: orders.length,
      totalSpent,
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 4);
  const initials = form.name?.trim()?.charAt(0) || user?.name?.charAt(0) || "U";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((current) => ({ ...current, avatar: file }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("address", form.address);
    if (form.avatar) {
      formData.append("avatar", form.avatar);
    }

    try {
      setSaving(true);
      const nextUser = await updateProfile(formData);
      updateCurrentUser(nextUser);
      setEditing(false);
      showToast("Đã cập nhật tài khoản");
    } catch {
      showToast("Không cập nhật được tài khoản", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="fashion-account-page">
      <div className="fashion-account-hero">
        <div className="fashion-account-avatar">
          {avatarPreview ? <img src={avatarPreview} alt={form.name} /> : <span>{initials}</span>}
        </div>
        <div>
          <p>Dolia Account</p>
          <h1>Tài khoản cá nhân</h1>
          <span>Quản lý thông tin nhận hàng, ảnh đại diện và chi tiêu mua sắm của bạn.</span>
        </div>
        <Link to="/orders">Xem đơn hàng</Link>
      </div>

      <div className="fashion-account-stats">
        <article>
          <span>Tổng chi tiêu</span>
          <strong>{formatCurrency(spending.totalSpent)}</strong>
        </article>
        <article>
          <span>Đã thanh toán</span>
          <strong>{formatCurrency(spending.paidSpent)}</strong>
        </article>
        <article>
          <span>Tháng này</span>
          <strong>{formatCurrency(spending.currentMonthSpent)}</strong>
        </article>
        <article>
          <span>Đơn đã giao</span>
          <strong>{spending.deliveredOrders}</strong>
        </article>
      </div>

      <div className="fashion-account-layout">
        <section className="fashion-account-panel fashion-account-form">
          <div className="fashion-account-panel-head">
            <div>
              <p>Hồ sơ</p>
              <h2>Thông tin cá nhân</h2>
            </div>
            {!editing && (
              <button type="button" onClick={() => setEditing(true)}>
                Sửa thông tin
              </button>
            )}
          </div>

          {!editing ? (
            <div className="fashion-account-info-view">
              <article>
                <span>Họ tên</span>
                <strong>{user?.name || "Chưa cập nhật"}</strong>
              </article>
              <article>
                <span>Email</span>
                <strong>{user?.email || "Chưa cập nhật"}</strong>
              </article>
              <article>
                <span>Số điện thoại</span>
                <strong>{user?.phone || "Chưa cập nhật"}</strong>
              </article>
              <article className="wide">
                <span>Địa chỉ nhận hàng</span>
                <strong>{user?.address || "Chưa cập nhật địa chỉ"}</strong>
              </article>
            </div>
          ) : (
            <form className="fashion-account-edit-form" onSubmit={handleSubmit}>
              <label className="fashion-account-upload">
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                <i><Icon name="upload" size={20} /></i>
                <div>
                  <strong>Thay đổi avatar</strong>
                  <span>Chọn ảnh rõ mặt hoặc logo cá nhân.</span>
                </div>
              </label>

              <div className="fashion-account-fields">
                <label>
                  Họ tên
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                  Số điện thoại
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </label>
                <label>
                  Email
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <div className="wide">
                  <GoogleAddressPicker
                    value={form.address}
                    onChange={(address) => setForm((current) => ({ ...current, address }))}
                  />
                </div>
              </div>

              <div className="fashion-account-edit-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: user?.name || "",
                      phone: user?.phone || "",
                      email: user?.email || "",
                      address: user?.address || "",
                      avatar: null,
                    });
                    setAvatarPreview(user?.avatar || "");
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="fashion-account-panel fashion-account-spending">
          <div className="fashion-account-panel-head">
            <div>
              <p>Chi tiêu</p>
              <h2>5 tháng gần đây</h2>
            </div>
            <span>{spending.totalOrders} đơn</span>
          </div>

          {spending.monthly.length ? (
            <div className="fashion-account-chart">
              {spending.monthly.map(([month, value]) => (
                <div key={month}>
                  <span>{month.replace("-", "/")}</span>
                  <i>
                    <b style={{ height: `${Math.max((value / spending.maxMonthValue) * 100, 8)}%` }} />
                  </i>
                  <strong>{formatCurrency(value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="fashion-account-empty">Chưa có chi tiêu để thống kê.</div>
          )}
        </section>

        <section className="fashion-account-panel fashion-account-orders">
          <div className="fashion-account-panel-head">
            <div>
              <p>Gần đây</p>
              <h2>Đơn hàng mới nhất</h2>
            </div>
            <Link to="/orders">Tất cả</Link>
          </div>

          {loadingOrders ? (
            <div className="fashion-account-empty">Đang tải đơn hàng...</div>
          ) : recentOrders.length ? (
            <div className="fashion-account-order-list">
              {recentOrders.map((order) => (
                <Link key={order.id} to="/orders">
                  <div>
                    <strong>DH{String(order.id).padStart(4, "0")}</strong>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <small>{order.status}</small>
                  <b>{formatCurrency(Number(order.total_price))}</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className="fashion-account-empty">
              <span>Bạn chưa có đơn hàng nào.</span>
              <Link to="/">Mua sắm ngay</Link>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default Account;
