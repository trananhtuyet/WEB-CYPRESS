import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/Icon";
import { contactStorageKey, getStoredContactMessages } from "../../data/contactMessages";
import { useToast } from "../../hooks/useToast";
import { addAdminReply, getAdminContacts, updateContactStatus } from "../../services/contactService";

const statusLabels = {
  new: "Mới",
  replied: "Đã trả lời",
  closed: "Đã đóng",
};

const buildThreadMessages = (message) =>
  [
    { sender: "customer", text: message.message, createdAt: message.createdAt || message.id },
    ...(message.customerReplies || []).map((reply) => ({ sender: "customer", ...reply })),
    ...(message.replies || (message.reply ? [{ text: message.reply, createdAt: message.repliedAt }] : [])).map((reply) => ({
      sender: "admin",
      ...reply,
    })),
  ].sort((first, second) => Number(first.createdAt || 0) - Number(second.createdAt || 0));

function ContactManagement() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [usingLocalData, setUsingLocalData] = useState(false);

  useEffect(() => {
    let mounted = true;

    getAdminContacts()
      .then((contacts) => {
        if (!mounted) return;
        setUsingLocalData(false);
        setMessages(contacts);
        setSelectedId(contacts[0]?.id || null);
      })
      .catch(() => {
        if (!mounted) return;
        const data = getStoredContactMessages().map((message) => ({
          status: "new",
          reply: "",
          createdAt: message.createdAt || message.id,
          ...message,
        }));
        setUsingLocalData(true);
        setMessages(data);
        setSelectedId(data[0]?.id || null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedMessage = messages.find((message) => message.id === selectedId);
  const filteredMessages =
    activeStatus === "all" ? messages : messages.filter((message) => message.status === activeStatus);

  const stats = useMemo(
    () => ({
      total: messages.length,
      new: messages.filter((message) => message.status === "new").length,
      replied: messages.filter((message) => message.status === "replied").length,
    }),
    [messages]
  );

  const persistMessages = (nextMessages) => {
    setMessages(nextMessages);
    localStorage.setItem(contactStorageKey, JSON.stringify(nextMessages));
  };

  const updateLocalMessage = (messageId, patch) => {
    const nextMessages = messages.map((message) => (message.id === messageId ? { ...message, ...patch } : message));
    persistMessages(nextMessages);
  };

  const replaceMessage = (nextMessage) => {
    setMessages((current) => current.map((message) => (message.id === nextMessage.id ? nextMessage : message)));
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!selectedMessage) return;

    const reply = replyText.trim();
    if (!reply) {
      showToast("Vui lòng nhập nội dung phản hồi", "error");
      return;
    }

    try {
      if (usingLocalData) {
        updateLocalMessage(selectedMessage.id, {
          reply,
          replies: [
            ...(selectedMessage.replies || (selectedMessage.reply ? [{ text: selectedMessage.reply, createdAt: selectedMessage.repliedAt }] : [])),
            { text: reply, createdAt: Date.now() },
          ],
          status: "replied",
          repliedAt: Date.now(),
        });
      } else {
        replaceMessage(await addAdminReply(selectedMessage.id, reply));
      }
      setReplyText("");
      showToast("Đã lưu phản hồi khách hàng");
    } catch {
      showToast("Không lưu được phản hồi vào database", "error");
    }
  };

  const handleCloseMessage = async () => {
    if (!selectedMessage) return;

    try {
      if (usingLocalData) {
        updateLocalMessage(selectedMessage.id, { status: "closed" });
      } else {
        replaceMessage(await updateContactStatus(selectedMessage.id, "closed"));
      }
      showToast("Đã đóng yêu cầu liên hệ");
    } catch {
      showToast("Không cập nhật được trạng thái liên hệ", "error");
    }
  };

  return (
    <section className="contact-admin-page">
      <div className="contact-admin-heading">
        <div>
          <p className="admin-home-kicker">Customer Support</p>
          <h1>Liên hệ khách hàng</h1>
        </div>
      </div>

      <div className="contact-admin-stats">
        <article>
          <span>Tổng liên hệ</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Chưa trả lời</span>
          <strong>{stats.new}</strong>
        </article>
        <article>
          <span>Đã phản hồi</span>
          <strong>{stats.replied}</strong>
        </article>
      </div>

      <div className="contact-admin-tabs">
        {["all", "new", "replied", "closed"].map((status) => (
          <button
            key={status}
            type="button"
            className={activeStatus === status ? "active" : ""}
            onClick={() => setActiveStatus(status)}
          >
            {status === "all" ? "Tất cả" : statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="contact-admin-layout">
        <section className="contact-admin-list">
          {filteredMessages.length ? (
            filteredMessages.map((message) => (
              <button
                key={message.id}
                type="button"
                className={selectedId === message.id ? "active" : ""}
                data-initial={message.name?.charAt(0) || "K"}
                onClick={() => setSelectedId(message.id)}
              >
                <span className={`contact-admin-status ${message.status}`}>{statusLabels[message.status]}</span>
                <strong>{message.name}</strong>
                <small>{message.topic}</small>
                <p>{message.message}</p>
              </button>
            ))
          ) : (
            <div className="contact-admin-empty">Chưa có liên hệ phù hợp.</div>
          )}
        </section>

        <aside className="contact-admin-detail">
          {selectedMessage ? (
            <>
              <div className="contact-admin-customer">
                <i>{selectedMessage.name?.charAt(0) || "K"}</i>
                <div>
                  <strong>{selectedMessage.name}</strong>
                  <span>{selectedMessage.topic}</span>
                  <small>{selectedMessage.phone || "Chưa có số điện thoại"} · {selectedMessage.email || "Chưa có email"}</small>
                </div>
                <span className={`contact-admin-status ${selectedMessage.status}`}>{statusLabels[selectedMessage.status]}</span>
              </div>

              <div className="contact-admin-chat-body">
                <div className="contact-chat-day">Chủ đề: {selectedMessage.topic}</div>
                {buildThreadMessages(selectedMessage).map((message, index) =>
                  message.sender === "admin" ? (
                    <div key={`${message.sender}-${message.createdAt || index}`} className="contact-chat-row admin">
                      <div className="contact-chat-bubble">
                        <p>{message.text}</p>
                        <small>Dolia Admin</small>
                      </div>
                      <i>A</i>
                    </div>
                  ) : (
                    <div key={`${message.sender}-${message.createdAt || index}`} className="contact-chat-row customer">
                      <i>{selectedMessage.name?.charAt(0) || "K"}</i>
                      <div className="contact-chat-bubble">
                        <p>{message.text}</p>
                        <small>Khách hàng</small>
                      </div>
                    </div>
                  )
                )}
              </div>

              <form className="contact-chat-composer" onSubmit={handleReply}>
                <textarea
                  rows="2"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Nhập tin nhắn trả lời..."
                />
                <div>
                  <button type="submit"><Icon name="mail" /> Gửi</button>
                  <button type="button" onClick={handleCloseMessage}>
                    Đóng yêu cầu
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="contact-admin-empty">Chọn một liên hệ để xem chi tiết.</div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default ContactManagement;
