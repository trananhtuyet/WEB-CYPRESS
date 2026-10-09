import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { getStoredContactMessages } from "../../data/contactMessages";
import api from "../../services/api";
import { getAdminContacts } from "../../services/contactService";

const supportGuides = [
  {
    title: "Thanh toán ví mô phỏng",
    text: "Chọn ví điện tử mô phỏng ở checkout, mở màn hình ví demo và bấm thanh toán thành công để tạo đơn đã thanh toán.",
  },
  {
    title: "Đơn hàng admin",
    text: "Admin chỉ được cập nhật trạng thái xử lý đơn. Tổng tiền, địa chỉ và sản phẩm được giữ nguyên để bảo toàn dữ liệu đối soát.",
  },
  {
    title: "Báo cáo doanh thu",
    text: "Trang báo cáo tổng hợp đơn hàng, trạng thái thanh toán, top sản phẩm, tồn kho thấp và hỗ trợ xuất CSV.",
  },
  {
    title: "Dữ liệu demo",
    text: "Có thể chạy npm run seed:demo-sales trong backend để tạo thêm khách hàng, đơn hàng và giao dịch thanh toán demo.",
  },
];

function SupportCenter() {
  const [messages, setMessages] = useState([]);
  const [health, setHealth] = useState({ status: "checking", message: "Đang kiểm tra API..." });
  const [activeGuide, setActiveGuide] = useState(0);

  useEffect(() => {
    getAdminContacts()
      .then(setMessages)
      .catch(() => setMessages(getStoredContactMessages()));

    api.get("/health")
      .then((response) => setHealth({ status: "online", message: response.data?.message || "API đang hoạt động" }))
      .catch(() => setHealth({ status: "offline", message: "Không kết nối được API backend" }));
  }, []);

  const stats = useMemo(() => {
    const total = messages.length;
    const newMessages = messages.filter((message) => (message.status || "new") === "new").length;
    const replied = messages.filter((message) => message.status === "replied").length;
    const closed = messages.filter((message) => message.status === "closed").length;

    return { total, newMessages, replied, closed };
  }, [messages]);

  return (
    <section className="admin-support-page">
      <div className="admin-support-heading">
        <div>
          <p className="admin-home-kicker">Admin Support</p>
          <h1>Hỗ trợ vận hành</h1>
          <span>Kiểm tra hệ thống, xem hướng dẫn nhanh và xử lý yêu cầu khách hàng.</span>
        </div>
        <Link to="/admin/contacts">Mở liên hệ khách hàng</Link>
      </div>

      <div className="admin-support-stats">
        <article>
          <span>Trạng thái API</span>
          <strong className={health.status}>{health.status === "online" ? "Online" : health.status === "offline" ? "Offline" : "Checking"}</strong>
          <small>{health.message}</small>
        </article>
        <article>
          <span>Tổng yêu cầu</span>
          <strong>{stats.total}</strong>
          <small>{stats.newMessages} yêu cầu mới</small>
        </article>
        <article>
          <span>Đã phản hồi</span>
          <strong>{stats.replied}</strong>
          <small>{stats.closed} yêu cầu đã đóng</small>
        </article>
      </div>

      <div className="admin-support-grid">
        <section className="admin-support-panel">
          <div className="admin-support-panel-head">
            <h2>Hướng dẫn nhanh</h2>
          </div>
          <div className="admin-support-guides">
            <nav>
              {supportGuides.map((guide, index) => (
                <button
                  key={guide.title}
                  type="button"
                  className={activeGuide === index ? "active" : ""}
                  onClick={() => setActiveGuide(index)}
                >
                  {guide.title}
                </button>
              ))}
            </nav>
            <article>
              <span><Icon name="help" size={24} /></span>
              <h3>{supportGuides[activeGuide].title}</h3>
              <p>{supportGuides[activeGuide].text}</p>
            </article>
          </div>
        </section>

        <section className="admin-support-panel">
          <div className="admin-support-panel-head">
            <h2>Checklist trước demo</h2>
          </div>
          <div className="admin-support-checklist">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Backend đang chạy ở cổng 5000</span>
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              <span>Frontend đang chạy ở cổng 5173</span>
            </label>
            <label>
              <input type="checkbox" />
              <span>Đã tạo dữ liệu demo doanh số</span>
            </label>
            <label>
              <input type="checkbox" />
              <span>Đã thử ví điện tử mô phỏng</span>
            </label>
          </div>
        </section>

        <section className="admin-support-panel admin-support-wide">
          <div className="admin-support-panel-head">
            <h2>Yêu cầu gần đây</h2>
            <Link to="/admin/contacts">Xem tất cả</Link>
          </div>
          <div className="admin-support-tickets">
            {messages.slice(0, 5).map((message) => (
              <article key={message.id}>
                <div>
                  <strong>{message.name}</strong>
                  <span>{message.topic}</span>
                </div>
                <p>{message.message}</p>
                <small>{message.status || "new"}</small>
              </article>
            ))}
            {!messages.length && <p className="admin-support-empty">Chưa có yêu cầu hỗ trợ nào từ khách hàng.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

export default SupportCenter;
