import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/Icon";
import {
  createVoucher,
  deleteVoucher,
  getAdminVouchers,
  updateVoucher,
} from "../../services/voucherService";
import { useToast } from "../../hooks/useToast";

const initialForm = {
  code: "",
  name: "",
  type: "percent",
  value: "",
  min_order_amount: "0",
  max_discount_amount: "",
  usage_limit: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getVoucherValue = (voucher) =>
  ({
    percent: `${Number(voucher.value)}%`,
    fixed: formatCurrency(Number(voucher.value)),
    tiered: `${Number(voucher.value)}% theo bậc`,
    free_shipping: "Miễn phí ship",
    gift: "Quà tặng",
  }[voucher.type] || voucher.type);

const getVoucherTypeLabel = (type) =>
  ({
    percent: "Giảm phần trăm",
    fixed: "Giảm tiền",
    tiered: "Voucher bậc thang",
    free_shipping: "Miễn phí vận chuyển",
    gift: "Quà tặng kèm",
  }[type] || type);

const needsDiscountValue = (type) => !["free_shipping", "gift"].includes(type);

const getVoucherStatus = (voucher) => {
  const now = new Date();
  if (!voucher.is_active) return { label: "Đã tắt", className: "cancelled" };
  if (voucher.starts_at && new Date(voucher.starts_at) > now) return { label: "Sắp diễn ra", className: "processing" };
  if (voucher.ends_at && new Date(voucher.ends_at) < now) return { label: "Hết hạn", className: "failed" };
  if (voucher.usage_limit && Number(voucher.used_count) >= Number(voucher.usage_limit)) {
    return { label: "Hết lượt", className: "failed" };
  }
  return { label: "Đang chạy", className: "paid" };
};

function VoucherManagement() {
  const { showToast } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadVouchers = async () => {
    const data = await getAdminVouchers();
    setVouchers(data);
  };

  useEffect(() => {
    loadVouchers().catch(() => setVouchers([]));
  }, []);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const status = getVoucherStatus(voucher);
      const haystack = `${voucher.code} ${voucher.name}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) return false;
      if (statusFilter && status.label !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter, vouchers]);

  const stats = useMemo(() => {
    const activeCount = vouchers.filter((voucher) => getVoucherStatus(voucher).label === "Đang chạy").length;
    const usedCount = vouchers.reduce((sum, voucher) => sum + Number(voucher.used_count || 0), 0);
    return { activeCount, usedCount };
  }, [vouchers]);

  const openCreateForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (voucher) => {
    setEditingId(voucher.id);
    setForm({
      code: voucher.code || "",
      name: voucher.name || "",
      type: voucher.type || "percent",
      value: String(voucher.value ?? ""),
      min_order_amount: String(voucher.min_order_amount ?? 0),
      max_discount_amount: voucher.max_discount_amount === null ? "" : String(voucher.max_discount_amount),
      usage_limit: voucher.usage_limit === null ? "" : String(voucher.usage_limit),
      starts_at: formatInputDate(voucher.starts_at),
      ends_at: formatInputDate(voucher.ends_at),
      is_active: Boolean(voucher.is_active),
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        is_active: Boolean(form.is_active),
      };

      if (editingId) {
        await updateVoucher(editingId, payload);
        showToast("Đã cập nhật voucher");
      } else {
        await createVoucher(payload);
        showToast("Đã tạo voucher");
      }

      resetForm();
      await loadVouchers();
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể lưu voucher", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVoucher(id);
      showToast("Đã xóa voucher");
      await loadVouchers();
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể xóa voucher", "error");
    }
  };

  return (
    <section className="voucher-admin-page">
      <div className="product-admin-heading">
        <h1>Quản Lý Voucher</h1>
        <button type="button" className="product-admin-primary" onClick={openCreateForm}>
          + Thêm Voucher
        </button>
      </div>

      <div className="dashboard-stat-grid voucher-admin-stats">
        <article className="dashboard-stat-card">
          <div>
            <span>Tổng voucher</span>
            <strong>{vouchers.length}</strong>
            <small>Mã đã tạo</small>
          </div>
          <i><Icon name="money" /></i>
        </article>
        <article className="dashboard-stat-card">
          <div>
            <span>Đang chạy</span>
            <strong>{stats.activeCount}</strong>
            <small>Có thể dùng ở checkout</small>
          </div>
          <i><Icon name="check" /></i>
        </article>
        <article className="dashboard-stat-card">
          <div>
            <span>Lượt đã dùng</span>
            <strong>{stats.usedCount}</strong>
            <small>Tổng số lần áp mã</small>
          </div>
          <i><Icon name="repeat" /></i>
        </article>
      </div>

      <div className="product-admin-toolbar">
        <label className="product-admin-search">
          <input
            type="search"
            placeholder="Tìm theo mã hoặc tên voucher..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span>⌕</span>
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="Đang chạy">Đang chạy</option>
          <option value="Sắp diễn ra">Sắp diễn ra</option>
          <option value="Hết hạn">Hết hạn</option>
          <option value="Hết lượt">Hết lượt</option>
          <option value="Đã tắt">Đã tắt</option>
        </select>
      </div>

      <section className="product-admin-table-card">
        <div className="product-admin-table-title">Danh sách voucher</div>
        <div className="product-admin-table-wrap">
          <table className="product-admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên voucher</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Giảm tối đa</th>
                <th>Lượt dùng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => {
                const status = getVoucherStatus(voucher);
                return (
                  <tr key={voucher.id}>
                    <td><strong>{voucher.code}</strong></td>
                    <td>{voucher.name}</td>
                    <td>{getVoucherTypeLabel(voucher.type)}</td>
                    <td>{getVoucherValue(voucher)}</td>
                    <td>{formatCurrency(Number(voucher.min_order_amount))}</td>
                    <td>{voucher.max_discount_amount === null ? "-" : formatCurrency(Number(voucher.max_discount_amount))}</td>
                    <td>{voucher.used_count}/{voucher.usage_limit || "Không giới hạn"}</td>
                    <td>
                      <span>{voucher.starts_at ? formatInputDate(voucher.starts_at) : "Không giới hạn"}</span>
                      <span>{voucher.ends_at ? ` -> ${formatInputDate(voucher.ends_at)}` : ""}</span>
                    </td>
                    <td>
                      <span className={`dashboard-payment-status ${status.className}`}>{status.label}</span>
                    </td>
                    <td>
                      <div className="product-admin-actions">
                        <button type="button" title="Sửa" onClick={() => openEditForm(voucher)}>
                          <Icon name="edit" />
                        </button>
                        <button type="button" title="Xóa" onClick={() => handleDelete(voucher.id)}>
                          <Icon name="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="product-admin-drawer" role="dialog" aria-modal="true">
          <form className="product-admin-form" onSubmit={handleSubmit}>
            <div className="product-admin-form-head">
              <h2>{editingId ? "Cập Nhật Voucher" : "Thêm Voucher"}</h2>
              <button type="button" onClick={resetForm}>×</button>
            </div>

            <label>
              Mã voucher
              <input
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                placeholder="VD: SUMMER20"
                required
              />
            </label>
            <label>
              Tên voucher
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Giảm mùa hè"
                required
              />
            </label>
            <label>
              Loại giảm
              <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="percent">Giảm theo phần trăm</option>
                <option value="fixed">Giảm số tiền</option>
                <option value="tiered">Voucher bậc thang</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
                <option value="gift">Quà tặng kèm</option>
              </select>
            </label>
            <label>
              Giá trị
              <input
                type="number"
                min={needsDiscountValue(form.type) ? "1" : "0"}
                max={["percent", "tiered"].includes(form.type) ? "100" : undefined}
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                placeholder={["percent", "tiered"].includes(form.type) ? "10" : form.type === "fixed" ? "50000" : "0"}
                required={needsDiscountValue(form.type)}
              />
            </label>
            <label>
              Đơn tối thiểu
              <input
                type="number"
                min="0"
                value={form.min_order_amount}
                onChange={(event) => setForm((current) => ({ ...current, min_order_amount: event.target.value }))}
              />
            </label>
            <label>
              Giảm tối đa
              <input
                type="number"
                min="0"
                value={form.max_discount_amount}
                onChange={(event) => setForm((current) => ({ ...current, max_discount_amount: event.target.value }))}
                placeholder="Để trống nếu không giới hạn"
              />
            </label>
            <label>
              Giới hạn lượt dùng
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(event) => setForm((current) => ({ ...current, usage_limit: event.target.value }))}
                placeholder="Để trống nếu không giới hạn"
              />
            </label>
            <label>
              Ngày bắt đầu
              <input
                type="date"
                value={form.starts_at}
                onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))}
              />
            </label>
            <label>
              Ngày kết thúc
              <input
                type="date"
                value={form.ends_at}
                onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))}
              />
            </label>
            <label className="voucher-admin-toggle">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              />
              Bật voucher
            </label>

            <div className="product-admin-form-actions">
              <button type="button" onClick={resetForm}>Hủy</button>
              <button type="submit">{editingId ? "Cập Nhật" : "Tạo Voucher"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default VoucherManagement;
