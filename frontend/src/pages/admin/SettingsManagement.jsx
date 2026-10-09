import { useEffect, useState } from "react";
import Icon from "../../components/Icon";
import { useToast } from "../../hooks/useToast";

const settingsKey = "dolia_admin_settings";

const defaultSettings = {
  storeName: "Dolia Fashion Boutique",
  storeEmail: "hello@dolia.vn",
  hotline: "091 140 8966",
  address: "48 Nguyễn Trãi, Quận 1",
  openTime: "09:00",
  closeTime: "21:00",
  freeShippingFrom: 699000,
  lowStockThreshold: 10,
  autoConfirmPaidOrders: true,
  allowDemoWallet: true,
  maintenanceMode: false,
};

const getStoredSettings = () => {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(settingsKey) || "{}") };
  } catch {
    return defaultSettings;
  }
};

function SettingsManagement() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleChange = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    showToast("Đã lưu cài đặt cửa hàng");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
    showToast("Đã khôi phục cài đặt mặc định");
  };

  return (
    <section className="admin-settings-page">
      <div className="admin-settings-heading">
        <div>
          <p className="admin-home-kicker">Store Settings</p>
          <h1>Cài đặt cửa hàng</h1>
          <span>Quản lý thông tin vận hành, thanh toán demo và cảnh báo tồn kho.</span>
        </div>
        <button type="button" onClick={handleReset}>
          Khôi phục mặc định
        </button>
      </div>

      <form className="admin-settings-layout" onSubmit={handleSubmit}>
        <section className="admin-settings-panel">
          <div className="admin-settings-panel-head">
            <span><Icon name="settings" /></span>
            <div>
              <h2>Thông tin cửa hàng</h2>
              <p>Thông tin này dùng cho vận hành và hiển thị nội bộ.</p>
            </div>
          </div>

          <div className="admin-settings-fields">
            <label>
              Tên cửa hàng
              <input value={settings.storeName} onChange={(event) => handleChange("storeName", event.target.value)} />
            </label>
            <label>
              Email hỗ trợ
              <input type="email" value={settings.storeEmail} onChange={(event) => handleChange("storeEmail", event.target.value)} />
            </label>
            <label>
              Hotline
              <input value={settings.hotline} onChange={(event) => handleChange("hotline", event.target.value)} />
            </label>
            <label>
              Địa chỉ
              <input value={settings.address} onChange={(event) => handleChange("address", event.target.value)} />
            </label>
          </div>
        </section>

        <section className="admin-settings-panel">
          <div className="admin-settings-panel-head">
            <span><Icon name="orders" /></span>
            <div>
              <h2>Vận hành đơn hàng</h2>
              <p>Thiết lập ngưỡng và quy tắc xử lý đơn.</p>
            </div>
          </div>

          <div className="admin-settings-fields compact">
            <label>
              Giờ mở cửa
              <input type="time" value={settings.openTime} onChange={(event) => handleChange("openTime", event.target.value)} />
            </label>
            <label>
              Giờ đóng cửa
              <input type="time" value={settings.closeTime} onChange={(event) => handleChange("closeTime", event.target.value)} />
            </label>
            <label>
              Miễn phí vận chuyển từ
              <input
                type="number"
                min="0"
                value={settings.freeShippingFrom}
                onChange={(event) => handleChange("freeShippingFrom", Number(event.target.value) || 0)}
              />
            </label>
            <label>
              Cảnh báo tồn kho thấp
              <input
                type="number"
                min="0"
                value={settings.lowStockThreshold}
                onChange={(event) => handleChange("lowStockThreshold", Number(event.target.value) || 0)}
              />
            </label>
          </div>
        </section>

        <section className="admin-settings-panel">
          <div className="admin-settings-panel-head">
            <span><Icon name="money" /></span>
            <div>
              <h2>Thanh toán và an toàn</h2>
              <p>Các công tắc phục vụ demo và kiểm soát trạng thái cửa hàng.</p>
            </div>
          </div>

          <div className="admin-settings-toggles">
            <label>
              <input
                type="checkbox"
                checked={settings.autoConfirmPaidOrders}
                onChange={(event) => handleChange("autoConfirmPaidOrders", event.target.checked)}
              />
              <span>Tự xác nhận đơn đã thanh toán</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.allowDemoWallet}
                onChange={(event) => handleChange("allowDemoWallet", event.target.checked)}
              />
              <span>Bật ví điện tử mô phỏng</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(event) => handleChange("maintenanceMode", event.target.checked)}
              />
              <span>Chế độ bảo trì</span>
            </label>
          </div>
        </section>
        <div className="admin-settings-submit">
          <button type="submit">Lưu cài đặt</button>
        </div>
      </form>
    </section>
  );
}

export default SettingsManagement;
