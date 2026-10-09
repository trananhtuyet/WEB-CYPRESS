describe("Dolia Shop - Phân hệ đơn hàng", () => {
  const user = {
    id: 2,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    phone: "0123",
    address: "123 Beauty Street",
  };

  const loginUrl = `${Cypress.config("baseUrl")}/login`;

  const orders = [
    {
      id: 10,
      user_id: 2,
      total_price: 747000,
      status: "pending",
      address: "Người nhận: Alice\nĐịa chỉ: 123 Beauty Street",
      created_at: "2026-05-01T10:00:00.000Z",
      paymentTransaction: {
        gateway: "bank_transfer",
        status: "pending",
        transaction_code: "BANK-DH0010",
      },
      items: [
        {
          id: 1,
          product_id: 1,
          quantity: 2,
          price: 299000,
          product: {
            id: 1,
            name: "Radiance Glow Serum",
            image: "https://images.example.com/serum.jpg",
          },
        },
        {
          id: 2,
          product_id: 2,
          quantity: 1,
          price: 149000,
          product: {
            id: 2,
            name: "Velvet Matte Lipstick",
            image: "https://images.example.com/lipstick.jpg",
          },
        },
      ],
    },
    {
      id: 11,
      user_id: 2,
      total_price: 399000,
      status: "shipping",
      address: "Người nhận: Alice\nĐịa chỉ: 123 Beauty Street",
      created_at: "2026-05-03T09:30:00.000Z",
      paymentTransaction: {
        gateway: "cod",
        status: "unpaid",
        transaction_code: "COD-DH0011",
      },
      items: [
        {
          id: 3,
          product_id: 3,
          quantity: 1,
          price: 399000,
          product: {
            id: 3,
            name: "Silk Repair Mask",
            image: "https://images.example.com/mask.jpg",
          },
        },
      ],
    },
    {
      id: 12,
      user_id: 2,
      total_price: 520000,
      status: "delivered",
      address: "Người nhận: Alice\nĐịa chỉ: 123 Beauty Street",
      created_at: "2026-05-05T14:45:00.000Z",
      paymentTransaction: {
        gateway: "mockwallet",
        status: "paid",
        transaction_code: "MW-DH0012",
      },
      items: [
        {
          id: 4,
          product_id: 4,
          quantity: 2,
          price: 260000,
          product: {
            id: 4,
            name: "Glow Cushion Foundation",
            image: "https://images.example.com/foundation.jpg",
          },
        },
      ],
    },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const getOrderCard = (orderCode) => cy.contains(".fashion-order-card", orderCode);

  const expectOrderPaymentSummary = (orderCode, paymentStatus, paymentGateway, recipient) => {
    getOrderCard(orderCode).within(() => {
      cy.get(".fashion-order-payment").should("contain.text", paymentStatus);
      cy.get(".fashion-order-payment").should("contain.text", paymentGateway);
      if (recipient) {
        cy.get("footer span").should("contain.text", recipient);
      }
    });
  };

  const expectOrdersStat = (label, expectedValue) => {
    cy.contains(".fashion-orders-stats article", label)
      .should("contain.text", String(expectedValue));
  };

  const visitOrdersPage = () => {
    cy.visit("/orders", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "mock-user-token");
        window.localStorage.setItem("user", JSON.stringify(user));
      },
    });
  };

  const mockOrdersPage = ({ orderBody = orders, orderStatusCode = 200 } = {}) => {
    cy.mockCatalog();

    cy.intercept("GET", "**/api/users/2", {
      statusCode: 200,
      body: user,
    }).as("getCurrentUser");

    cy.intercept("GET", "**/api/cart", {
      statusCode: 200,
      body: {
        id: 1,
        user_id: 2,
        items: [],
        totalPrice: 0,
      },
    }).as("getCart");

    cy.intercept("GET", "**/api/orders/user", {
      statusCode: orderStatusCode,
      body: orderBody,
    }).as("getUserOrders");

    visitOrdersPage();
    cy.wait("@getUserOrders");
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV0: Khách chưa đăng nhập truy cập đơn hàng sẽ bị chuyển hướng đến trang đăng nhập", () => {
    cy.mockCatalog();

    cy.visit("/orders");

    cy.url().should("eq", loginUrl);
    cy.contains('button[type="submit"]', "Đăng nhập").should("be.visible");
  });

  it("DV1: Trang đơn hàng hiển thị phần mở đầu, thống kê, tab và thẻ đơn hàng", () => {
    mockOrdersPage();

    cy.url().should("eq", `${Cypress.config("baseUrl")}/orders`);
    cy.contains("h1", "Đơn hàng của bạn").should("be.visible");
    cy.contains("span", "Theo dõi trạng thái xử lý, sản phẩm đã đặt và tổng thanh toán trong một nơi.").should("exist");
    cy.contains("span", "Tổng chi tiêu").should("exist");
    cy.contains("span", "Đang xử lý").should("exist");
    cy.contains("span", "Đã hoàn tất").should("exist");
    cy.contains("button", "Tất cả").should("exist");
    cy.contains("button", "Chờ xử lý").should("exist");
    cy.contains("button", "Đang giao").should("exist");
    cy.contains("button", "Đã giao").should("exist");
    cy.get(".fashion-order-card").should("have.length", 3);
    cy.contains("Radiance Glow Serum").should("exist");
    cy.contains("Silk Repair Mask").should("exist");
    cy.contains("Glow Cushion Foundation").should("exist");
  });

  it("DV2: Mỗi thẻ đơn hàng hiển thị trạng thái, tóm tắt thanh toán và thông tin người nhận", () => {
    mockOrdersPage();

    getOrderCard("DH0010").should("contain.text", "Chờ xử lý");
    expectOrderPaymentSummary("DH0010", "Chờ thanh toán", "Chuyển khoản ngân hàng", "Người nhận: Alice");

    getOrderCard("DH0011").should("contain.text", "Đang giao");
    expectOrderPaymentSummary("DH0011", "Chưa thanh toán", "Thanh toán khi nhận hàng");
  });

  it("API1: Dữ liệu đơn hàng được tải và các giá trị tổng hợp được tính chính xác", () => {
    mockOrdersPage();

    cy.get(".fashion-orders-hero aside strong").should("have.text", "3");
    expectOrdersStat("Tổng chi tiêu", formatCurrency(1666000));
    expectOrdersStat("Đang xử lý", 2);
    expectOrdersStat("Đã hoàn tất", 1);
    getOrderCard("DH0010").should("exist");
    getOrderCard("DH0011").should("exist");
    getOrderCard("DH0012").should("exist");
  });

  it("API2: Bấm vào tab trạng thái sẽ lọc đơn hàng theo trạng thái đó", () => {
    mockOrdersPage();

    cy.contains("button", "Đang giao").click();

    getOrderCard("DH0011").should("exist");
    getOrderCard("DH0010").should("not.exist");
    getOrderCard("DH0012").should("not.exist");
    cy.get(".fashion-order-card").should("have.length", 1);
  });

  it("API2B: Dữ liệu đơn hàng vẫn hiển thị sau khi tải lại trang", () => {
    mockOrdersPage();

    cy.reload();
    cy.wait("@getUserOrders");

    cy.get(".fashion-order-card").should("have.length", 3);
    getOrderCard("DH0010").should("exist");
    getOrderCard("DH0011").should("exist");
    getOrderCard("DH0012").should("exist");
  });

  it("API3: Đơn hàng chuyển khoản hiển thị modal xem trước mã QR và có thể đóng lại", () => {
    mockOrdersPage();

    cy.get(".fashion-order-qr-trigger").click();

    cy.contains('[role="dialog"]', "Mã QR chuyển khoản").should("be.visible");
    cy.contains('[role="dialog"] strong', "BANK-DH0010").should("exist");
    cy.contains('[role="dialog"]', "TRAN ANH TUYET").should("exist");
    cy.get('.fashion-qr-modal img[alt*="BANK-DH0010"]').should("exist");

    cy.contains(".fashion-qr-modal-actions button", "Đóng").click();
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("API4: Cập nhật trạng thái thanh toán thành công từ polling sẽ hiển thị toast thành công", () => {
    cy.clock();
    cy.mockCatalog();

    cy.intercept("GET", "**/api/orders/user", {
      times: 1,
      statusCode: 200,
      body: orders,
    }).as("getUserOrdersInitial");

    cy.intercept("GET", "**/api/orders/user", {
      statusCode: 200,
      body: orders.map((order) =>
        order.id === 10
          ? {
              ...order,
              paymentTransaction: {
                ...order.paymentTransaction,
                status: "paid",
              },
            }
          : order
      ),
    }).as("getUserOrdersRefresh");

    visitOrdersPage();

    cy.wait("@getUserOrdersInitial");
    cy.tick(10000);
    cy.wait("@getUserOrdersRefresh");

    cy.contains(".toast", "Đơn DH0010 đã thanh toán thành công").should("exist");
    expectOrderPaymentSummary("DH0010", "Đã thanh toán", "Chuyển khoản ngân hàng");
  });

  it("VAL1: Chọn tab không có đơn hàng phù hợp sẽ hiển thị thông báo trạng thái trống", () => {
    mockOrdersPage();

    cy.contains("button", "Đã hủy").click();

    cy.contains("h2", "Chưa có đơn hàng phù hợp.").should("be.visible");
    cy.contains("a", "Khám phá sản phẩm").should("be.visible");
  });

  it("NEG1: API đơn hàng lỗi sẽ fallback về trạng thái trống", () => {
    mockOrdersPage({
      orderStatusCode: 500,
      orderBody: { message: "Cannot load orders" },
    });

    cy.contains("h2", "Chưa có đơn hàng phù hợp.").should("be.visible");
    cy.contains("a", "Khám phá sản phẩm").should("be.visible");
  });

  it("NEG2: Phản hồi đơn hàng rỗng vẫn hiển thị trạng thái trống an toàn", () => {
    mockOrdersPage({ orderBody: [] });

    cy.contains("h2", "Chưa có đơn hàng phù hợp.").should("be.visible");
    cy.contains("a", "Khám phá sản phẩm").should("be.visible");
    cy.get(".fashion-order-card").should("not.exist");
  });

  it("E2E1: Người dùng có thể xem đơn chuyển khoản, mở mã QR và tiếp tục mua sắm", () => {
    mockOrdersPage();

    getOrderCard("DH0010").should("exist");
    expectOrderPaymentSummary("DH0010", "Chờ thanh toán", "Chuyển khoản ngân hàng");

    cy.get(".fashion-order-qr-trigger").click();
    cy.contains('[role="dialog"] strong', "BANK-DH0010").should("exist");
    cy.get(".fashion-qr-modal").click("topLeft");
    cy.get('[role="dialog"]').should("not.exist");

    cy.contains(".fashion-order-card footer a", "Tiếp tục mua sắm")
      .first()
      .should("have.attr", "href", "/");
  });

  it("E2E2: Liên kết tiếp tục mua sắm trong đơn hàng sẽ đưa người dùng về trang chủ", () => {
    mockOrdersPage();

    cy.contains(".fashion-order-card footer a", "Tiếp tục mua sắm")
      .first()
      .click();

    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
  });
});
