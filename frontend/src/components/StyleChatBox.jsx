import { useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { askStyleAssistant } from "../services/styleChatService";

const initialMessages = [
  {
    role: "assistant",
    content: "Chào bạn, mình là stylist AI của Dolia. Bạn muốn phối đồ đi học, đi làm, đi chơi hay tìm phong cách đang hot?",
  },
];

const suggestions = [
  "Phong cách nào đang hot?",
  "Phối đồ đi học cho nam",
  "Đi hẹn hò mặc gì?",
];

function StyleChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const compactHistory = useMemo(
    () => messages.map((message) => ({ role: message.role, content: message.content })).slice(-8),
    [messages]
  );

  const sendMessage = async (text = input) => {
    const question = text.trim();
    if (!question || loading) return;

    const userMessage = { role: "user", content: question };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await askStyleAssistant({
        message: question,
        history: compactHistory,
      });
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.response?.data?.message || "Mình chưa trả lời được lúc này. Bạn thử hỏi lại ngắn hơn nhé.",
        },
      ]);
    } finally {
      setLoading(false);
      window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className={`style-chatbox ${open ? "open" : ""}`}>
      {open && (
        <section className="style-chat-panel" aria-label="Stylist AI">
          <header>
            <div>
              <span>Stylist AI</span>
              <strong>Tư vấn phối đồ</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng chat">
              ×
            </button>
          </header>

          <div className="style-chat-messages">
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={message.role}>
                <p>{message.content}</p>
              </article>
            ))}
            {loading && (
              <article className="assistant">
                <p>Đang nghĩ outfit hợp gu cho bạn...</p>
              </article>
            )}
            <span ref={messagesEndRef} />
          </div>

          <div className="style-chat-suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} disabled={loading}>
                {suggestion}
              </button>
            ))}
          </div>

          <form className="style-chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Hỏi cách phối đồ, màu sắc, trend..."
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Gửi
            </button>
          </form>
        </section>
      )}

      <button className="style-chat-toggle" type="button" onClick={() => setOpen((current) => !current)}>
        <Icon name="chat" size={22} />
        <span>AI phối đồ</span>
      </button>
    </div>
  );
}

export default StyleChatBox;
