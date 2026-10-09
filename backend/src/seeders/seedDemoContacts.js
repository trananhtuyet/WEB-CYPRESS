const dotenv = require("dotenv");
const { sequelize, ContactMessage, ContactThread } = require("../models");

dotenv.config();

const timestamp = (value) => new Date(value);

const demoContacts = [
  {
    name: "Nguyễn Minh Anh",
    phone: "0903124568",
    email: "minhanh.nguyen@example.com",
    topic: "Hỗ trợ đơn hàng",
    status: "replied",
    created_at: timestamp("2026-04-19T09:12:00+07:00"),
    messages: [
      ["customer", "Mình vừa đặt đơn DH028, shop kiểm tra giúp mình khi nào giao tới Quận 7 được không?", "2026-04-19T09:12:00+07:00"],
      ["customer", "Mình cần nhận trước tối mai để kịp mang đi công tác.", "2026-04-19T09:18:00+07:00"],
      ["admin", "Dolia đã kiểm tra đơn DH028. Đơn đang được đóng gói và dự kiến giao trong ngày 20/04. Shop sẽ ưu tiên ghi chú giao trước 18:00 cho bạn.", "2026-04-19T09:31:00+07:00"],
      ["admin", "Nếu shipper chưa liên hệ trước 16:00 ngày mai, bạn nhắn lại để shop đẩy nhanh với đơn vị vận chuyển nhé.", "2026-04-19T09:35:00+07:00"],
    ],
  },
  {
    name: "Tạ Mỹ Duyên",
    phone: "0938457791",
    email: "duyen.ta@example.com",
    topic: "Đổi trả",
    status: "new",
    created_at: timestamp("2026-04-19T10:05:00+07:00"),
    messages: [
      ["customer", "Áo blazer mình nhận hơi rộng vai. Shop còn size S để đổi không ạ?", "2026-04-19T10:05:00+07:00"],
      ["customer", "Mình vẫn giữ tag và hóa đơn, mới thử một lần thôi.", "2026-04-19T10:08:00+07:00"],
    ],
  },
  {
    name: "Đinh Phương Anh",
    phone: "0972001845",
    email: "phuonganh.dinh@example.com",
    topic: "Tư vấn sản phẩm",
    status: "replied",
    created_at: timestamp("2026-04-18T16:42:00+07:00"),
    messages: [
      ["customer", "Mình cao 1m58 nặng 49kg, mẫu váy cotton rib nên chọn size nào cho vừa người?", "2026-04-18T16:42:00+07:00"],
      ["customer", "Mình thích mặc ôm vừa, không quá bó.", "2026-04-18T16:47:00+07:00"],
      ["admin", "Với số đo bạn gửi, Dolia gợi ý size S nếu thích ôm gọn. Nếu muốn thoải mái hơn phần eo, bạn có thể chọn size M.", "2026-04-18T17:02:00+07:00"],
    ],
  },
  {
    name: "Lê Bảo Trâm",
    phone: "0916248099",
    email: "baotram.le@example.com",
    topic: "Thanh toán",
    status: "closed",
    created_at: timestamp("2026-04-18T14:20:00+07:00"),
    messages: [
      ["customer", "Mình thanh toán ví mô phỏng xong rồi nhưng muốn kiểm tra đơn đã chuyển sang đã thanh toán chưa.", "2026-04-18T14:20:00+07:00"],
      ["admin", "Shop đã kiểm tra, giao dịch đã ghi nhận thành công và đơn đang ở trạng thái đã thanh toán.", "2026-04-18T14:33:00+07:00"],
      ["admin", "Dolia sẽ tiếp tục xử lý đơn và cập nhật trạng thái giao hàng trong mục lịch sử đơn hàng.", "2026-04-18T14:36:00+07:00"],
    ],
  },
  {
    name: "Trần Quỳnh Chi",
    phone: "0981123370",
    email: "quynhchi.tran@example.com",
    topic: "Tư vấn sản phẩm",
    status: "replied",
    created_at: timestamp("2026-04-17T19:04:00+07:00"),
    messages: [
      ["customer", "Shop phối giúp mình set đi sinh nhật, ưu tiên màu nhã và dễ chụp ảnh.", "2026-04-17T19:04:00+07:00"],
      ["customer", "Ngân sách khoảng 1 triệu rưỡi, mình thích chân váy hơn quần.", "2026-04-17T19:10:00+07:00"],
      ["admin", "Dolia gợi ý áo linen sáng màu phối chân váy midi và túi nhỏ. Set này nhẹ, lên ảnh thanh lịch và vẫn nằm trong ngân sách của bạn.", "2026-04-17T19:25:00+07:00"],
    ],
  },
  {
    name: "Hoàng Linh",
    phone: "0967782051",
    email: "linh.hoang@example.com",
    topic: "Hỗ trợ đơn hàng",
    status: "closed",
    created_at: timestamp("2026-04-16T11:24:00+07:00"),
    messages: [
      ["customer", "Đơn của mình báo đang giao nhưng shipper chưa gọi. Shop kiểm tra giúp mình nhé.", "2026-04-16T11:24:00+07:00"],
      ["customer", "Mình ở tòa S3, nếu giao giờ hành chính thì gửi lễ tân cũng được.", "2026-04-16T11:29:00+07:00"],
      ["admin", "Dolia đã liên hệ vận chuyển. Shipper sẽ gọi lại trong khoảng 30 phút và có thể gửi lễ tân theo ghi chú của bạn.", "2026-04-16T11:45:00+07:00"],
    ],
  },
];

const seedDemoContacts = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  let createdThreads = 0;
  let createdMessages = 0;

  for (const contact of demoContacts) {
    const [thread, wasCreated] = await ContactThread.findOrCreate({
      where: { email: contact.email, topic: contact.topic },
      defaults: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        topic: contact.topic,
        status: contact.status,
        created_at: contact.created_at,
        updated_at: contact.created_at,
      },
    });

    if (wasCreated) {
      createdThreads += 1;
    } else {
      await thread.update({ status: contact.status });
    }

    for (const [sender, text, createdAt] of contact.messages) {
      const [message, messageWasCreated] = await ContactMessage.findOrCreate({
        where: { contact_id: thread.id, sender, text },
        defaults: {
          contact_id: thread.id,
          sender,
          text,
          created_at: timestamp(createdAt),
          updated_at: timestamp(createdAt),
        },
      });

      if (messageWasCreated) {
        createdMessages += 1;
      } else {
        await message.update({ created_at: timestamp(createdAt), updated_at: timestamp(createdAt) });
      }
    }
  }

  console.log(`Created ${createdThreads} demo contact threads.`);
  console.log(`Created ${createdMessages} demo contact messages.`);
};

seedDemoContacts()
  .catch((error) => {
    console.error("Failed to seed demo contacts:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
