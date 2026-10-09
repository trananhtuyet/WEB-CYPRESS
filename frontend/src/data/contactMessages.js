export const contactStorageKey = "dolia_contact_messages";

const timestamp = (value) => new Date(value).getTime();

export const demoContactMessages = [
  {
    id: timestamp("2026-04-19T09:12:00+07:00"),
    name: "Nguyen Minh Anh",
    phone: "0903124568",
    email: "minhanh.nguyen@example.com",
    topic: "Hỗ trợ đơn hàng",
    message: "Mình vừa đặt đơn DH028, shop kiểm tra giúp mình khi nào giao tới Quận 7 được không?",
    status: "replied",
    createdAt: timestamp("2026-04-19T09:12:00+07:00"),
    customerReplies: [
      {
        text: "Mình cần nhận trước tối mai để kịp mang đi công tác.",
        createdAt: timestamp("2026-04-19T09:18:00+07:00"),
      },
    ],
    replies: [
      {
        text: "Dolia đã kiểm tra đơn DH028. Đơn đang được đóng gói và dự kiến giao trong ngày 20/04. Shop sẽ ưu tiên ghi chú giao trước 18:00 cho bạn.",
        createdAt: timestamp("2026-04-19T09:31:00+07:00"),
      },
      {
        text: "Nếu shipper chưa liên hệ trước 16:00 ngày mai, bạn nhắn lại để shop đẩy nhanh với đơn vị vận chuyển nhé.",
        createdAt: timestamp("2026-04-19T09:35:00+07:00"),
      },
    ],
    reply: "Dolia đã kiểm tra đơn DH028. Đơn đang được đóng gói và dự kiến giao trong ngày 20/04.",
    repliedAt: timestamp("2026-04-19T09:35:00+07:00"),
  },
  {
    id: timestamp("2026-04-19T10:05:00+07:00"),
    name: "Ta My Duyen",
    phone: "0938457791",
    email: "duyen.ta@example.com",
    topic: "Đổi trả",
    message: "Áo blazer mình nhận hơi rộng vai. Shop còn size S để đổi không ạ?",
    status: "new",
    createdAt: timestamp("2026-04-19T10:05:00+07:00"),
    customerReplies: [
      {
        text: "Mình vẫn giữ tag và hóa đơn, mới thử một lần thôi.",
        createdAt: timestamp("2026-04-19T10:08:00+07:00"),
      },
    ],
    replies: [],
  },
  {
    id: timestamp("2026-04-18T16:42:00+07:00"),
    name: "Dinh Phuong Anh",
    phone: "0972001845",
    email: "phuonganh.dinh@example.com",
    topic: "Tư vấn sản phẩm",
    message: "Mình cao 1m58 nặng 49kg, mẫu váy cotton rib nên chọn size nào cho vừa người?",
    status: "replied",
    createdAt: timestamp("2026-04-18T16:42:00+07:00"),
    customerReplies: [
      {
        text: "Mình thích mặc ôm vừa, không quá bó.",
        createdAt: timestamp("2026-04-18T16:47:00+07:00"),
      },
    ],
    replies: [
      {
        text: "Với số đo bạn gửi, Dolia gợi ý size S nếu thích ôm gọn. Nếu muốn thoải mái hơn phần eo, bạn có thể chọn size M.",
        createdAt: timestamp("2026-04-18T17:02:00+07:00"),
      },
    ],
    reply: "Với số đo bạn gửi, Dolia gợi ý size S nếu thích ôm gọn.",
    repliedAt: timestamp("2026-04-18T17:02:00+07:00"),
  },
  {
    id: timestamp("2026-04-18T14:20:00+07:00"),
    name: "Le Bao Tram",
    phone: "0916248099",
    email: "baotram.le@example.com",
    topic: "Thanh toán",
    message: "Mình thanh toán ví mô phỏng xong rồi nhưng muốn kiểm tra đơn đã chuyển sang đã thanh toán chưa.",
    status: "closed",
    createdAt: timestamp("2026-04-18T14:20:00+07:00"),
    customerReplies: [],
    replies: [
      {
        text: "Shop đã kiểm tra, giao dịch đã ghi nhận thành công và đơn đang ở trạng thái đã thanh toán.",
        createdAt: timestamp("2026-04-18T14:33:00+07:00"),
      },
      {
        text: "Dolia sẽ tiếp tục xử lý đơn và cập nhật trạng thái giao hàng trong mục lịch sử đơn hàng.",
        createdAt: timestamp("2026-04-18T14:36:00+07:00"),
      },
    ],
    reply: "Shop đã kiểm tra, giao dịch đã ghi nhận thành công và đơn đang ở trạng thái đã thanh toán.",
    repliedAt: timestamp("2026-04-18T14:36:00+07:00"),
  },
  {
    id: timestamp("2026-04-17T19:04:00+07:00"),
    name: "Tran Quynh Chi",
    phone: "0981123370",
    email: "quynhchi.tran@example.com",
    topic: "Tư vấn sản phẩm",
    message: "Shop phối giúp mình set đi sinh nhật, ưu tiên màu nhã và dễ chụp ảnh.",
    status: "replied",
    createdAt: timestamp("2026-04-17T19:04:00+07:00"),
    customerReplies: [
      {
        text: "Ngân sách khoảng 1 triệu rưỡi, mình thích chân váy hơn quần.",
        createdAt: timestamp("2026-04-17T19:10:00+07:00"),
      },
    ],
    replies: [
      {
        text: "Dolia gợi ý áo linen sáng màu phối chân váy midi và túi nhỏ. Set này nhẹ, lên ảnh thanh lịch và vẫn nằm trong ngân sách của bạn.",
        createdAt: timestamp("2026-04-17T19:25:00+07:00"),
      },
    ],
    reply: "Dolia gợi ý áo linen sáng màu phối chân váy midi và túi nhỏ.",
    repliedAt: timestamp("2026-04-17T19:25:00+07:00"),
  },
  {
    id: timestamp("2026-04-16T11:24:00+07:00"),
    name: "Hoang Linh",
    phone: "0967782051",
    email: "linh.hoang@example.com",
    topic: "Hỗ trợ đơn hàng",
    message: "Đơn của mình báo đang giao nhưng shipper chưa gọi. Shop kiểm tra giúp mình nhé.",
    status: "closed",
    createdAt: timestamp("2026-04-16T11:24:00+07:00"),
    customerReplies: [
      {
        text: "Mình ở tòa S3, nếu giao giờ hành chính thì gửi lễ tân cũng được.",
        createdAt: timestamp("2026-04-16T11:29:00+07:00"),
      },
    ],
    replies: [
      {
        text: "Dolia đã liên hệ vận chuyển. Shipper sẽ gọi lại trong khoảng 30 phút và có thể gửi lễ tân theo ghi chú của bạn.",
        createdAt: timestamp("2026-04-16T11:45:00+07:00"),
      },
    ],
    reply: "Dolia đã liên hệ vận chuyển. Shipper sẽ gọi lại trong khoảng 30 phút.",
    repliedAt: timestamp("2026-04-16T11:45:00+07:00"),
  },
];

export const getStoredContactMessages = () => {
  try {
    const storedMessages = JSON.parse(localStorage.getItem(contactStorageKey) || "[]");
    const storedIds = new Set(storedMessages.map((message) => message.id));
    const missingDemoMessages = demoContactMessages.filter((message) => !storedIds.has(message.id));

    if (!missingDemoMessages.length) {
      return storedMessages;
    }

    const nextMessages = [...storedMessages, ...missingDemoMessages].sort(
      (first, second) => Number(second.createdAt || second.id || 0) - Number(first.createdAt || first.id || 0)
    );
    localStorage.setItem(contactStorageKey, JSON.stringify(nextMessages));
    return nextMessages;
  } catch {
    return demoContactMessages;
  }
};
