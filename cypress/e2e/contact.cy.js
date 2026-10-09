describe("Dolia Shop - Phân hệ liên hệ", () => {
  const user = {
    id: 2,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    phone: "0123",
    address: "123 Beauty Street",
  };

  const contact = {
    id: 1001,
    name: "Alice",
    phone: "0123",
    email: "alice@example.com",
    topic: "Hỗ trợ đơn hàng",
    message: "Mình muốn kiểm tra trạng thái đơn hàng gần nhất.",
    status: "replied",
    createdAt: Date.parse("2026-05-10T10:00:00.000Z"),
    customerReplies: [
      {
        text: "Mình cần nhận trước cuối tuần.",
        createdAt: Date.parse("2026-05-10T10:05:00.000Z"),
      },
    ],
    replies: [
      {
        text: "Dolia đã kiểm tra và sẽ ưu tiên giao sớm cho bạn.",
        createdAt: Date.parse("2026-05-10T10:15:00.000Z"),
      },
    ],
  };

  const contactReplyResponse = {
    ...contact,
    customerReplies: [
      ...contact.customerReplies,
      {
        text: "Cảm ơn shop, mình chờ thêm cập nhật nhé.",
        createdAt: Date.parse("2026-05-10T10:20:00.000Z"),
      },
    ],
  };

  const loginUrl = `${Cypress.config("baseUrl")}/login`;

  const mockContactPage = ({
    authUser = null,
    lookupStatusCode = 200,
    lookupBody = [contact],
    createStatusCode = 201,
    createBody,
    replyStatusCode = 200,
    replyBody = contactReplyResponse,
  } = {}) => {
    if (authUser?.id) {
      cy.intercept("GET", `**/api/users/${authUser.id}`, {
        statusCode: 200,
        body: authUser,
      }).as("getCurrentUser");
    }

    cy.intercept("GET", "**/api/contacts/lookup*", {
      statusCode: lookupStatusCode,
      body: lookupBody,
    }).as("lookupContacts");

    cy.intercept("POST", "**/api/contacts", {
      statusCode: createStatusCode,
      body: createBody || {
        ...contact,
        id: 1002,
        status: "new",
        customerReplies: [],
        replies: [],
      },
    }).as("createContact");

    cy.intercept("POST", `**/api/contacts/${contact.id}/customer-replies`, {
      statusCode: replyStatusCode,
      body: replyBody,
    }).as("addCustomerReply");

    cy.visit("/contact", {
      onBeforeLoad(window) {
        window.localStorage.clear();
        if (authUser) {
          window.localStorage.setItem("token", "mock-user-token");
          window.localStorage.setItem("user", JSON.stringify(authUser));
        }
      },
    });

    if (authUser?.id) {
      cy.wait("@getCurrentUser");
    }
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang liên hệ hiển thị các kênh hỗ trợ, biểu mẫu và khu vực phản hồi", () => {
    mockContactPage({ authUser: user });

    cy.contains("h1", "Liên hệ cửa hàng").should("be.visible");
    cy.contains("strong", "Hotline").should("exist");
    cy.contains("strong", "Email").should("exist");
    cy.contains("strong", "Zalo").should("exist");
    cy.contains("h2", "Dolia có thể hỗ trợ gì cho bạn?").should("exist");
    cy.contains("h2", "Phản hồi từ Dolia").should("exist");
  });

  it("API1: Thông tin người dùng đã đăng nhập tự điền biểu mẫu liên hệ và tải đúng hội thoại liên quan", () => {
    mockContactPage({ authUser: user });

    cy.get('input[name="name"]').should("have.value", "Alice");
    cy.get('input[name="phone"]').should("have.value", "0123");
    cy.get('input[name="email"]').should("have.value", "alice@example.com");

    cy.wait("@lookupContacts");
    cy.contains(".fashion-contact-thread header strong", "Hỗ trợ đơn hàng").should("exist");
    cy.contains(".fashion-contact-bubble.shop", "Dolia đã kiểm tra và sẽ ưu tiên giao sớm cho bạn.").should("exist");
  });

  it("API2: Người dùng có thể gửi tin nhắn liên hệ lên backend", () => {
    mockContactPage({ authUser: user });

    cy.get('select[name="topic"]').select("Hỗ trợ đơn hàng");
    cy.get('textarea[name="message"]').clear().type("Mình muốn kiểm tra trạng thái đơn hàng gần nhất.");
    cy.contains('button[type="submit"]', "Gửi liên hệ").click();

    cy.wait("@createContact").its("request.body").should("deep.equal", {
      name: "Alice",
      phone: "0123",
      email: "alice@example.com",
      topic: "Hỗ trợ đơn hàng",
      message: "Mình muốn kiểm tra trạng thái đơn hàng gần nhất.",
    });

    cy.contains(".toast", "Đã gửi liên hệ tới cửa hàng").should("exist");
  });

  it("API3: Người dùng có thể phản hồi trong một hội thoại hỗ trợ hiện có", () => {
    mockContactPage({ authUser: user });

    cy.wait("@lookupContacts");
    cy.get(".fashion-contact-thread-reply input")
      .first()
      .type("Cảm ơn shop, mình chờ thêm cập nhật nhé.");
    cy.contains(".fashion-contact-thread-reply button", "Gửi")
      .first()
      .click();

    cy.wait("@addCustomerReply").its("request.body").should("deep.equal", {
      text: "Cảm ơn shop, mình chờ thêm cập nhật nhé.",
    });

    cy.contains(".toast", "Đã gửi phản hồi tới shop").should("exist");
    cy.contains(".fashion-contact-bubble.customer", "Cảm ơn shop, mình chờ thêm cập nhật nhé.").should("exist");
  });

  it("VAL1: Phản hồi hội thoại rỗng sẽ bị chặn và hiển thị toast lỗi", () => {
    mockContactPage({ authUser: user });

    cy.wait("@lookupContacts");
    cy.contains(".fashion-contact-thread-reply button", "Gửi")
      .first()
      .click();

    cy.contains(".toast", "Vui lòng nhập nội dung phản hồi").should("exist");
  });

  it("NEG1: Tra cứu liên hệ thất bại sẽ fallback sang dữ liệu liên hệ cục bộ", () => {
    mockContactPage({
      authUser: user,
      lookupStatusCode: 500,
      lookupBody: { message: "Lookup failed" },
    });

    cy.wait("@lookupContacts");
    cy.get(".fashion-contact-thread-list").should("exist");
    cy.contains("h2", "Phản hồi từ Dolia").should("exist");
  });

  it("NEG2: Khách có thể mở trang liên hệ nhưng gửi thất bại sẽ hiển thị toast lỗi", () => {
    mockContactPage({
      authUser: null,
      createStatusCode: 500,
      createBody: { message: "Cannot create contact" },
    });

    cy.get('input[name="name"]').type("Guest User");
    cy.get('input[name="phone"]').type("0900000000");
    cy.get('input[name="email"]').type("guest@example.com");
    cy.get('textarea[name="message"]').type("Mình cần tư vấn thêm về sản phẩm.");
    cy.contains('button[type="submit"]', "Gửi liên hệ").click();

    cy.wait("@createContact");
    cy.contains(".toast", "Không gửi được liên hệ tới database").should("exist");
  });

  it("NEG3: Khách vẫn có thể gửi liên hệ thành công khi backend chấp nhận", () => {
    mockContactPage({
      authUser: null,
      createBody: {
        id: 1003,
        name: "Guest User",
        phone: "0900000000",
        email: "guest@example.com",
        topic: "Tư vấn sản phẩm",
        message: "Mình cần tư vấn thêm về sản phẩm.",
        status: "new",
        customerReplies: [],
        replies: [],
      },
    });

    cy.get('input[name="name"]').type("Guest User");
    cy.get('input[name="phone"]').type("0900000000");
    cy.get('input[name="email"]').type("guest@example.com");
    cy.get('textarea[name="message"]').type("Mình cần tư vấn thêm về sản phẩm.");
    cy.contains('button[type="submit"]', "Gửi liên hệ").click();

    cy.wait("@createContact");
    cy.contains(".toast", "Đã gửi liên hệ tới cửa hàng").should("exist");
  });

  it("NEG4: Chế độ fallback cục bộ vẫn có thể lưu một hội thoại liên hệ mới", () => {
    mockContactPage({
      authUser: user,
      lookupStatusCode: 500,
      lookupBody: { message: "Lookup failed" },
    });

    cy.wait("@lookupContacts");
    cy.get('select[name="topic"]').select("Đổi trả");
    cy.get('textarea[name="message"]').clear().type("Mình muốn tạo liên hệ mới ở chế độ local.");
    cy.contains('button[type="submit"]', "Gửi liên hệ").click();

    cy.contains(".toast", "Đã gửi liên hệ tới cửa hàng").should("exist");
    cy.window().then((window) => {
      const stored = JSON.parse(window.localStorage.getItem("dolia_contact_messages"));
      expect(stored.some((message) => message.message === "Mình muốn tạo liên hệ mới ở chế độ local.")).to.equal(true);
    });
  });

  it("NEG5: Chế độ fallback cục bộ vẫn có thể thêm phản hồi của khách hàng", () => {
    mockContactPage({
      authUser: user,
      lookupStatusCode: 500,
      lookupBody: { message: "Lookup failed" },
    });

    cy.wait("@lookupContacts");
    cy.get(".fashion-contact-thread-reply input")
      .first()
      .type("Phản hồi local fallback từ khách.");
    cy.contains(".fashion-contact-thread-reply button", "Gửi")
      .first()
      .click();

    cy.contains(".toast", "Đã gửi phản hồi tới shop").should("exist");
    cy.contains(".fashion-contact-bubble.customer", "Phản hồi local fallback từ khách.").should("exist");
  });

  it("E2E1: Người dùng có thể gửi liên hệ và tiếp tục hội thoại ngay trên cùng trang", () => {
    mockContactPage({ authUser: user });

    cy.get('select[name="topic"]').select("Thanh toán");
    cy.get('textarea[name="message"]').clear().type("Mình muốn hỏi thêm về xác nhận thanh toán.");
    cy.contains('button[type="submit"]', "Gửi liên hệ").click();

    cy.wait("@createContact");
    cy.contains(".toast", "Đã gửi liên hệ tới cửa hàng").should("exist");
    cy.get('textarea[name="message"]').should("have.value", "");
  });
});
