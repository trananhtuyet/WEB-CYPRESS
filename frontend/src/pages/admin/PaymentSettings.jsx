import { useMemo, useState } from "react";
import Icon from "../../components/Icon";
import { createBankQrUrl, defaultPaymentConfig, getPaymentConfig, savePaymentConfig } from "../../utils/paymentConfig";
import { useToast } from "../../hooks/useToast";

const bankOptions = [
  { code: "MB", name: "MB Bank" },
  { code: "VCB", name: "Vietcombank" },
  { code: "TCB", name: "Techcombank" },
  { code: "ACB", name: "ACB" },
  { code: "BIDV", name: "BIDV" },
  { code: "VPB", name: "VPBank" },
  { code: "TPB", name: "TPBank" },
];

function PaymentSettings() {
  const { showToast } = useToast();
  const [config, setConfig] = useState(getPaymentConfig);
  const [previewAmount, setPreviewAmount] = useState(299000);

  const qrUrl = useMemo(
    () => createBankQrUrl({ amount: previewAmount, orderCode: "PREVIEW", config }),
    [config, previewAmount]
  );

  const handleChange = (field, value) => {
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const handleQrUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh QR", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setConfig((current) => ({ ...current, customQrImage: reader.result }));
      showToast("Đã chọn ảnh QR cửa hàng");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    savePaymentConfig(config);
    showToast("Đã lưu QR thanh toán ngân hàng");
  };

  const handleReset = () => {
    setConfig(defaultPaymentConfig);
    savePaymentConfig(defaultPaymentConfig);
    showToast("Đã khôi phục cấu hình mặc định");
  };

  return (
    <section className="payment-admin-page">
      <div className="payment-admin-heading">
        <div>
          <p className="admin-home-kicker">Bank Payment</p>
          <h1>QR thanh toán ngân hàng</h1>
        </div>
        <button type="button" onClick={handleReset}>Khôi phục mặc định</button>
      </div>

      <div className="payment-admin-layout">
        <form className="payment-admin-panel" onSubmit={handleSubmit}>
          <div className="payment-admin-panel-head">
            <span><Icon name="money" /></span>
            <div>
              <h2>Thông tin tài khoản nhận tiền</h2>
              <p>Khách chọn chuyển khoản sẽ quét QR này ở trang thanh toán.</p>
            </div>
          </div>

          <label>
            Ngân hàng
            <select value={config.bankCode} onChange={(event) => handleChange("bankCode", event.target.value)}>
              {bankOptions.map((bank) => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
          </label>
          <label>
            Số tài khoản
            <input
              value={config.accountNumber}
              onChange={(event) => handleChange("accountNumber", event.target.value)}
              placeholder="Nhập số tài khoản nhận tiền"
              required
            />
          </label>
          <label>
            Tên chủ tài khoản
            <input
              value={config.accountName}
              onChange={(event) => handleChange("accountName", event.target.value.toUpperCase())}
              placeholder="Tên chủ tài khoản"
              required
            />
          </label>
          <label>
            Tiền tố nội dung chuyển khoản
            <input
              value={config.transferNotePrefix}
              onChange={(event) => handleChange("transferNotePrefix", event.target.value.toUpperCase())}
              placeholder="VD: DOLIA"
            />
          </label>
          <label>
            Số tiền xem trước
            <input
              type="number"
              min="0"
              value={previewAmount}
              onChange={(event) => setPreviewAmount(Number(event.target.value) || 0)}
            />
          </label>
          <label className="payment-admin-upload">
            Ảnh QR cố định của cửa hàng
            <input type="file" accept="image/*" onChange={handleQrUpload} />
            <span>{config.customQrImage ? "Đổi ảnh QR cửa hàng" : "Tải ảnh QR cửa hàng lên"}</span>
          </label>
          {config.customQrImage && (
            <button
              type="button"
              className="payment-admin-secondary"
              onClick={() => handleChange("customQrImage", "")}
            >
              Dùng lại QR tự động theo số tiền
            </button>
          )}
          <button type="submit">Lưu mã QR</button>
        </form>

        <aside className="payment-admin-preview">
          <p>QR xem trước</p>
          <img src={qrUrl} alt="QR thanh toán ngân hàng" />
          <div>
            <strong>{config.accountName}</strong>
            <span>{config.bankCode} · {config.accountNumber}</span>
            <small>Nội dung: {config.transferNotePrefix || "DOLIA"} PREVIEW</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PaymentSettings;
