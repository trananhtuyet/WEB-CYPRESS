describe("Dolia Shop - Phân hệ tài khoản", () => {
  const user = {
    id: 2,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    phone: "0123",
    address: "123 Beauty Street",
    avatar: "",
  };

  const admin = {
    id: 1,
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
  };

  const orders = [
    {
      id: 10,
      total_price: 747000,
      status: "pending",
      created_at: "2026-05-02T10:00:00.000Z",
      paymentTransaction: { status: "pending" },
    },
    {
      id: 11,
      total_price: 399000,
      status: "delivered",
      created_at: "2026-05-06T12:00:00.000Z",
      paymentTransaction: { status: "paid" },
    },
    {
      id: 12,
      total_price: 520000,
      status: "shipping",
      created_at: "2026-04-15T09:00:00.000Z",
      paymentTransaction: { status: "paid" },
    },
    {
      id: 13,
      total_price: 200000,
      status: "cancelled",
      created_at: "2026-05-10T08:00:00.000Z",
      paymentTransaction: { status: "unpaid" },
    },
  ];

  const loginUrl = `${Cypress.config("baseUrl")}/login`;
  const adminUrl = `${Cypress.config("baseUrl")}/admin`;
  const ordersUrl = `${Cypress.config("baseUrl")}/orders`;
  const avatarUpload = {
    contents: Cypress.Buffer.from("fake-avatar-content"),
    fileName: "avatar.png",
    mimeType: "image/png",
    lastModified: Date.now(),
  };
  const secondAvatarUpload = {
    contents: Cypress.Buffer.from("another-avatar-content"),
    fileName: "avatar-2.png",
    mimeType: "image/png",
    lastModified: Date.now() + 1,
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const expectRequestField = (body, fieldName, expectedValue) => {
    if (body && typeof body.get === "function") {
      expect(body.get(fieldName)).to.equal(expectedValue);
      return;
    }

    if (body && typeof body === "object") {
      expect(body[fieldName]).to.equal(expectedValue);
      return;
    }

    expect(body).to.be.a("string");
    expect(body).to.include(`name="${fieldName}"`);
    expect(body).to.include(expectedValue);
  };

  const expectRequestFileField = (body, fieldName, fileName) => {
    if (body && typeof body.get === "function") {
      expect(body.get(fieldName)).to.not.equal(null);
      return;
    }

    if (body && typeof body === "object") {
      expect(body[fieldName]).to.exist;
      return;
    }

    expect(body).to.be.a("string");
    expect(body).to.include(`name="${fieldName}"`);
    expect(body).to.include(`filename="${fileName}"`);
  };

  const mockAccountPage = ({
    authUser = user,
    orderBody = orders,
    orderStatusCode = 200,
    updateStatusCode = 200,
    updateBody,
    interceptProfileUpdate = true,
    waitForCurrentUser = authUser?.role === "user",
  } = {}) => {
    cy.mockCatalog();

    if (authUser?.id) {
      cy.intercept("GET", `**/api/users/${authUser.id}`, {
        statusCode: 200,
        body: authUser,
      }).as("getCurrentUser");
    }

    cy.intercept("GET", "**/api/orders/user", {
      statusCode: orderStatusCode,
      body: orderBody,
    }).as("getUserOrders");

    if (interceptProfileUpdate) {
      cy.intercept("PUT", "**/api/users/me", {
        statusCode: updateStatusCode,
        body: updateBody || {
          ...authUser,
          name: "Alice Nguyen",
          phone: "0988888888",
          email: "alice.nguyen@example.com",
          address: "48 Nguyen Trai, Quan 1",
        },
      }).as("updateProfile");
    }

    cy.visit("/account", {
      onBeforeLoad(window) {
        if (authUser) {
          window.localStorage.setItem("token", "mock-user-token");
          window.localStorage.setItem("user", JSON.stringify(authUser));
        }
      },
    });

    if (authUser?.id && waitForCurrentUser) {
      cy.wait("@getCurrentUser");
    }
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV0: Khách chưa đăng nhập truy cập tài khoản sẽ bị chuyển hướng đến trang đăng nhập", () => {
    cy.mockCatalog();

    cy.visit("/account");

    cy.url().should("eq", loginUrl);
    cy.contains('button[type="submit"]', "Đăng nhập").should("be.visible");
  });

  it("DV1: Trang tài khoản người dùng hiển thị phần mở đầu, thống kê, thông tin hồ sơ và đơn hàng gần đây", () => {
    mockAccountPage();

    cy.wait("@getUserOrders");

    cy.contains("h1", "Tài khoản cá nhân").should("be.visible");
    cy.contains("span", "Quản lý thông tin nhận hàng, ảnh đại diện và chi tiêu mua sắm của bạn.").should("exist");
    cy.contains("span", "Tổng chi tiêu").should("exist");
    cy.contains("span", "Đã thanh toán").should("exist");
    cy.contains("span", "Tháng này").should("exist");
    cy.contains("span", "Đơn đã giao").should("exist");
    cy.contains("h2", "Thông tin cá nhân").should("exist");
    cy.contains("strong", "Alice").should("exist");
    cy.contains("strong", "alice@example.com").should("exist");
    cy.contains("h2", "Đơn hàng mới nhất").should("exist");
    cy.contains("strong", "DH0010").should("exist");
  });

  it("DV2: Tài khoản admin truy cập trang tài khoản sẽ bị chuyển hướng đến dashboard quản trị", () => {
    mockAccountPage({
      authUser: admin,
      waitForCurrentUser: false,
    });

    cy.url().should("eq", adminUrl);
  });

  it("API1: Thống kê chi tiêu của tài khoản được tính đúng từ các đơn hàng của người dùng", () => {
    mockAccountPage();

    cy.wait("@getUserOrders");

    cy.contains(".fashion-account-stats article", "Tổng chi tiêu")
      .should("contain.text", formatCurrency(1666000));
    cy.contains(".fashion-account-stats article", "Đã thanh toán")
      .should("contain.text", formatCurrency(919000));
    cy.contains(".fashion-account-stats article", "Tháng này")
      .should("contain.text", formatCurrency(1146000));
    cy.contains(".fashion-account-stats article", "Đơn đã giao")
      .should("contain.text", "1");
  });

  it("API2: Người dùng có thể chuyển sang chế độ chỉnh sửa và cập nhật thông tin hồ sơ", () => {
    mockAccountPage();

    cy.wait("@getUserOrders");
    cy.contains("button", "Sửa thông tin").click();

    cy.get('input[name="name"]').clear().type("Alice Nguyen");
    cy.get('input[name="phone"]').clear().type("0988888888");
    cy.get('input[name="email"]').clear().type("alice.nguyen@example.com");
    cy.contains('button[type="submit"]', "Lưu thay đổi").click();

    cy.wait("@updateProfile").then((interception) => {
      const { body, headers } = interception.request;

      expect(headers["content-type"]).to.include("multipart/form-data");
      expectRequestField(body, "name", "Alice Nguyen");
      expectRequestField(body, "phone", "0988888888");
      expectRequestField(body, "email", "alice.nguyen@example.com");
    });

    cy.contains(".toast", "Đã cập nhật tài khoản").should("exist");
    cy.contains("strong", "Alice Nguyen").should("exist");
    cy.contains("strong", "alice.nguyen@example.com").should("exist");
  });

  it("API2B: Chọn ảnh đại diện mới sẽ hiển thị xem trước trước khi lưu", () => {
    mockAccountPage();

    cy.contains("button", "Sửa thông tin").click();
    cy.get('.fashion-account-upload input[type="file"]').selectFile(avatarUpload, { force: true });

    cy.get(".fashion-account-avatar img")
      .should("be.visible")
      .invoke("attr", "src")
      .should("match", /^blob:/);
  });

  it("API2C: Lưu hồ sơ với ảnh đại diện mới sẽ cập nhật ảnh đang hiển thị", () => {
    mockAccountPage({
      updateBody: {
        ...user,
        name: "Alice Nguyen",
        phone: "0988888888",
        email: "alice.nguyen@example.com",
        address: "48 Nguyen Trai, Quan 1",
        avatar: "https://images.example.com/alice-avatar.png",
      },
    });

    cy.contains("button", "Sửa thông tin").click();
    cy.get('.fashion-account-upload input[type="file"]').selectFile(avatarUpload, { force: true });
    cy.get('input[name="name"]').clear().type("Alice Nguyen");
    cy.contains('button[type="submit"]', "Lưu thay đổi").click();

    cy.wait("@updateProfile").then((interception) => {
      const { body, headers } = interception.request;

      expect(headers["content-type"]).to.include("multipart/form-data");
      expectRequestFileField(body, "avatar", "avatar.png");
      expectRequestField(body, "name", "Alice Nguyen");
    });

    cy.contains(".toast", "Đã cập nhật tài khoản").should("exist");
    cy.get(".fashion-account-avatar img")
      .should("have.attr", "src", "https://images.example.com/alice-avatar.png");
  });

  it("API2D: Trạng thái đang lưu sẽ vô hiệu nút gửi và hiển thị nhãn đang tải", () => {
    mockAccountPage({ interceptProfileUpdate: false });

    cy.contains("button", "Sửa thông tin").click();

    cy.intercept("PUT", "**/api/users/me", (req) => {
      req.reply((res) => {
        res.delay = 500;
        res.send({
          statusCode: 200,
          body: {
            ...user,
            name: "Alice Nguyen",
          },
        });
      });
    }).as("slowUpdateProfile");

    cy.get('input[name="name"]').clear().type("Alice Nguyen");
    cy.contains('button[type="submit"]', "Lưu thay đổi").click();

    cy.get('button[type="submit"]').should("be.disabled").and("contain.text", "Đang lưu...");
    cy.wait("@slowUpdateProfile");
    cy.contains(".toast", "Đã cập nhật tài khoản").should("exist");
  });

  it("API3: Hủy chế độ chỉnh sửa sẽ khôi phục thông tin tài khoản ban đầu", () => {
    mockAccountPage();

    cy.contains("button", "Sửa thông tin").click();

    cy.get('input[name="name"]').clear().type("Temporary Name");
    cy.get('input[name="phone"]').clear().type("0999999999");
    cy.contains("button", "Hủy").click();

    cy.contains("strong", "Alice").should("exist");
    cy.contains("strong", "0123").should("exist");
    cy.get(".fashion-account-edit-form").should("not.exist");
  });

  it("API3B: Hủy chế độ chỉnh sửa sẽ xóa phần xem trước ảnh đại diện tạm thời", () => {
    mockAccountPage();

    cy.contains("button", "Sửa thông tin").click();
    cy.get('.fashion-account-upload input[type="file"]').selectFile(avatarUpload, { force: true });
    cy.get(".fashion-account-avatar img").should("exist");

    cy.contains("button", "Hủy").click();

    cy.get(".fashion-account-avatar img").should("not.exist");
    cy.contains(".fashion-account-avatar span", "A").should("exist");
  });

  it("API3C: Chọn ảnh đại diện thứ hai sẽ thay thế phần xem trước trước đó", () => {
    mockAccountPage();

    cy.contains("button", "Sửa thông tin").click();
    cy.get('.fashion-account-upload input[type="file"]').selectFile(avatarUpload, { force: true });
    cy.get(".fashion-account-avatar img")
      .invoke("attr", "src")
      .then((firstPreview) => {
        cy.get('.fashion-account-upload input[type="file"]').selectFile(secondAvatarUpload, { force: true });
        cy.get(".fashion-account-avatar img")
          .invoke("attr", "src")
          .should((secondPreview) => {
            expect(secondPreview).to.match(/^blob:/);
            expect(secondPreview).to.not.equal(firstPreview);
          });
      });
  });

  it("VAL1: Phản hồi đơn hàng gần đây rỗng vẫn hiển thị trạng thái trống an toàn cho tài khoản", () => {
    mockAccountPage({ orderBody: [] });

    cy.wait("@getUserOrders");

    cy.contains(".fashion-account-empty", "Chưa có chi tiêu để thống kê.").should("be.visible");
    cy.contains(".fashion-account-empty", "Bạn chưa có đơn hàng nào.").should("be.visible");
    cy.contains("a", "Mua sắm ngay").should("be.visible");
  });

  it("NEG1: API đơn hàng lỗi nhưng trang tài khoản vẫn sử dụng được", () => {
    mockAccountPage({
      orderStatusCode: 500,
      orderBody: { message: "Cannot load orders" },
    });

    cy.wait("@getUserOrders");

    cy.contains("h1", "Tài khoản cá nhân").should("be.visible");
    cy.contains(".fashion-account-empty", "Chưa có chi tiêu để thống kê.").should("be.visible");
    cy.contains(".fashion-account-empty", "Bạn chưa có đơn hàng nào.").should("be.visible");
  });

  it("NEG2: Cập nhật hồ sơ thất bại sẽ hiển thị toast lỗi và giữ nguyên chế độ chỉnh sửa", () => {
    mockAccountPage({
      updateStatusCode: 500,
      updateBody: { message: "Cannot update profile" },
    });

    cy.contains("button", "Sửa thông tin").click();
    cy.get('input[name="name"]').clear().type("Alice Nguyen");
    cy.contains('button[type="submit"]', "Lưu thay đổi").click();

    cy.wait("@updateProfile");
    cy.contains(".toast", "Không cập nhật được tài khoản").should("exist");
    cy.get(".fashion-account-edit-form").should("exist");
  });

  it("E2E1: Người dùng có thể mở trang đơn hàng từ lối tắt trong tài khoản", () => {
    mockAccountPage();

    cy.wait("@getUserOrders");

    cy.contains("a", "Xem đơn hàng").click();
    cy.url().should("eq", ordersUrl);
  });
});
