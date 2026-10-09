import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import { contactStorageKey, getStoredContactMessages } from "../data/contactMessages";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { addCustomerReply, createContact, getCustomerContacts } from "../services/contactService";

const contactChannels = [
  {
    title: "Hotline",
    value: "091 140 8966",
    description: "Tư vấn size, đơn hàng và đổi trả.",
    href: "tel:0911408966",
    icon: "bell",
  },
  {
    title: "Email",
    value: "hello@dolia.vn",
    description: "Gửi phản hồi chi tiết cho cửa hàng.",
    href: "mailto:hello@dolia.vn",
    icon: "mail",
  },
  {
    title: "Zalo",
    value: "Chat với Dolia",
    description: "Nhận hỗ trợ nhanh trong giờ mở cửa.",
    href: "https://zalo.me/0911408966",
    icon: "account",
  },
];

const buildThreadMessages = (message) =>
  [
    { sender: "customer", text: message.message, createdAt: message.createdAt || message.id },
    ...(message.customerReplies || []).map((reply) => ({ sender: "customer", ...reply })),
    ...(message.replies || (message.reply ? [{ text: message.reply, createdAt: message.repliedAt }] : [])).map((reply) => ({
      sender: "shop",
      ...reply,
    })),
  ].sort((first, second) => Number(first.createdAt || 0) - Number(second.createdAt || 0));

function Contact() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    topic: "Tư vấn sản phẩm",
    message: "",
  });
  const [messages, setMessages] = useState(() => {
    return getStoredContactMessages();
  });
  const [threadReplies, setThreadReplies] = useState({});
  const [usingLocalData, setUsingLocalData] = useState(false);
  const userMessages = useMemo(() => {
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    return messages.filter((message) => {
      const sameEmail = email && message.email?.trim().toLowerCase() === email;
      const samePhone = phone && message.phone?.trim() === phone;
      return sameEmail || samePhone;
    });
  }, [form.email, form.phone, messages]);

  useEffect(() => {
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!email && !phone) return;

    const timer = window.setTimeout(() => {
      getCustomerContacts({ email, phone })
        .then((contacts) => {
          setUsingLocalData(false);
          setMessages(contacts);
        })
        .catch(() => {
          setUsingLocalData(true);
          setMessages(getStoredContactMessages());
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [form.email, form.phone]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (usingLocalData) {
        const storedMessages = getStoredContactMessages();
        const nextMessages = [{ ...form, id: Date.now(), status: "new", replies: [] }, ...storedMessages];
        localStorage.setItem(contactStorageKey, JSON.stringify(nextMessages));
        setMessages(nextMessages);
      } else {
        const contact = await createContact(form);
        setMessages((current) => [contact, ...current]);
      }
      setForm((current) => ({ ...current, message: "" }));
      showToast("Đã gửi liên hệ tới cửa hàng");
    } catch {
      showToast("Không gửi được liên hệ tới database", "error");
    }
  };

  const handleThreadReplySubmit = async (event, messageId) => {
    event.preventDefault();
    const text = threadReplies[messageId]?.trim();

    if (!text) {
      showToast("Vui lòng nhập nội dung phản hồi", "error");
      return;
    }

    try {
      if (usingLocalData) {
        const nextMessages = messages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                status: "new",
                customerReplies: [
                  ...(message.customerReplies || []),
                  { text, createdAt: Date.now() },
                ],
              }
            : message
        );

        localStorage.setItem(contactStorageKey, JSON.stringify(nextMessages));
        setMessages(nextMessages);
      } else {
        const contact = await addCustomerReply(messageId, text);
        setMessages((current) => current.map((message) => (message.id === messageId ? contact : message)));
      }
      setThreadReplies((current) => ({ ...current, [messageId]: "" }));
      showToast("Đã gửi phản hồi tới shop");
    } catch {
      showToast("Không gửi được phản hồi tới database", "error");
    }
  };

  return (
    <section className="fashion-contact-page">
      <div className="fashion-contact-hero">
        <div>
          <p>Dolia Support</p>
          <h1>Liên hệ cửa hàng</h1>
          <span>Gửi câu hỏi về sản phẩm, đơn hàng, thanh toán hoặc đổi trả. Dolia sẽ phản hồi trong giờ làm việc.</span>
        </div>
        <aside>
          <strong>09:00 - 21:00</strong>
          <span>Hỗ trợ mỗi ngày</span>
        </aside>
      </div>

      <div className="fashion-contact-grid">
        <div className="fashion-contact-channels">
          {contactChannels.map((channel) => (
            <a key={channel.title} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              <i><Icon name={channel.icon} size={22} /></i>
              <div>
                <strong>{channel.title}</strong>
                <span>{channel.value}</span>
                <small>{channel.description}</small>
              </div>
            </a>
          ))}
        </div>

        <form className="fashion-contact-form" onSubmit={handleSubmit}>
          <p>Gửi lời nhắn</p>
          <h2>Dolia có thể hỗ trợ gì cho bạn?</h2>
          <div>
            <label>
              Họ tên
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Số điện thoại
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </label>
            <label>
              Chủ đề
              <select name="topic" value={form.topic} onChange={handleChange}>
                <option>Tư vấn sản phẩm</option>
                <option>Hỗ trợ đơn hàng</option>
                <option>Thanh toán</option>
                <option>Đổi trả</option>
              </select>
            </label>
            <label className="wide">
              Nội dung
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="Nhập nội dung cần hỗ trợ..."
                required
              />
            </label>
          </div>
          <button type="submit">Gửi liên hệ</button>
        </form>
      </div>

      <section className="fashion-contact-replies">
        <div className="fashion-contact-replies-head">
          <div>
            <p>Hộp thư hỗ trợ</p>
            <h2>Phản hồi từ Dolia</h2>
          </div>
          <span>{userMessages.length} cuộc trò chuyện</span>
        </div>

        {userMessages.length ? (
          <div className="fashion-contact-thread-list">
            {userMessages.map((message) => {
              const threadMessages = buildThreadMessages(message);
              return (
                <article key={message.id} className="fashion-contact-thread">
                  <header>
                    <div>
                      <strong>{message.topic}</strong>
                      <span>{message.status === "replied" ? "Đã có phản hồi" : "Đang chờ phản hồi"}</span>
                    </div>
                    <small>{message.phone}</small>
                  </header>
                  <div className="fashion-contact-chat">
                    {threadMessages.map((reply, index) => (
                      <div key={`${message.id}-${reply.sender}-${reply.createdAt || index}`} className={`fashion-contact-bubble ${reply.sender === "shop" ? "shop" : "customer"}`}>
                        <p>{reply.text}</p>
                        <small>{reply.sender === "shop" ? "Dolia Shop" : "Bạn"}</small>
                      </div>
                    ))}
                  </div>
                  <form
                    className="fashion-contact-thread-reply"
                    onSubmit={(event) => handleThreadReplySubmit(event, message.id)}
                  >
                    <input
                      value={threadReplies[message.id] || ""}
                      onChange={(event) =>
                        setThreadReplies((current) => ({ ...current, [message.id]: event.target.value }))
                      }
                      placeholder="Phản hồi lại shop..."
                    />
                    <button type="submit">Gửi</button>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="fashion-contact-no-reply">
            <strong>Chưa có phản hồi nào.</strong>
            <span>Gửi liên hệ bằng email hoặc số điện thoại của bạn để Dolia phản hồi tại đây.</span>
          </div>
        )}
      </section>
    </section>
  );
}

export default Contact;
