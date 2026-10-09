describe("Dolia Shop - Phân hệ checkout", () => {
  const user = {
    id: 2,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    phone: "0123",
    address: "123 Beauty Street",
  };

  const cart = {
    id: 1,
    user_id: 2,
    items: [
      {
        id: 1,
        product_id: 1,
        quantity: 2,
        product: {
          id: 1,
          name: "Radiance Glow Serum",
          price: 299000,
          image: "https://images.example.com/serum.jpg",
        },
      },
      {
        id: 2,
        product_id: 2,
        quantity: 1,
        product: {
          id: 2,
          name: "Velvet Matte Lipstick",
          price: 199000,
          image: "https://images.example.com/lipstick.jpg",
        },
      },
    ],
    totalPrice: 797000,
  };

  const vouchers = [
    {
      id: 1,
      code: "SAVE50",
      name: "Giảm 50K",
      type: "fixed",
      value: 50000,
      min_order_amount: 0,
      max_discount_amount: null,
    },
    {
      id: 2,
      code: "VIP20",
      name: "Giảm 20%",
      type: "percent",
      value: 20,
      min_order_amount: 1000000,
      max_discount_amount: 100000,
    },
  ];

  const checkoutUrl = `${Cypress.config("baseUrl")}/checkout`;
  const loginUrl = `${Cypress.config("baseUrl")}/login`;
  const ordersUrl = `${Cypress.config("baseUrl")}/orders`;
  const cartUrl = `${Cypress.config("baseUrl")}/cart`;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const expectCheckoutSummaryTotal = (expectedTotal) => {
    cy.get(".fashion-checkout-summary").within(() => {
      cy.contains("p", "Tóm tắt thanh toán").should("exist");
      cy.get("h2").should("contain.text", formatCurrency(expectedTotal));
      cy.contains("span", "Cần thanh toán")
        .parent()
        .find("strong")
        .should("contain.text", formatCurrency(expectedTotal));
    });
  };

  const expectCheckoutSummaryLine = (label, expectedValue) => {
    cy.get(".fashion-checkout-summary").within(() => {
      cy.contains("span", label)
        .parent()
        .find("strong")
        .should("contain.text", expectedValue);
    });
  };

  const defaultOrderResponse = {
    id: 10,
    total_price: 747000,
    status: "pending",
  };

  const defaultMockWalletResponse = {
    transactionCode: "mockwallet_2_123456",
    amount: 747000,
    orderUrl: "http://localhost:5173/mock-wallet?transactionCode=mockwallet_2_123456",
  };

  const visitCheckoutPage = ({ selectedProductIds = [1, 2] } = {}) => {
    cy.visit("/checkout", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "mock-user-token");
        window.localStorage.setItem("user", JSON.stringify(user));
        window.sessionStorage.setItem("dolia_checkout_product_ids", JSON.stringify(selectedProductIds));
      },
    });
  };

  const waitForCheckoutData = () => {
    cy.wait("@getCurrentUser");
    cy.wait("@getCart");
    cy.wait("@getVouchers");
  };

  const mockCheckoutPage = ({
    selectedProductIds = [1, 2],
    vouchersStatusCode = 200,
    vouchersBody = vouchers,
    orderStatusCode = 201,
    orderBody = defaultOrderResponse,
    walletStatusCode = 200,
    walletBody = defaultMockWalletResponse,
  } = {}) => {
    cy.mockCatalog();

    cy.intercept("GET", "**/api/users/2", {
      statusCode: 200,
      body: user,
    }).as("getCurrentUser");

    cy.intercept("GET", "**/api/cart", {
      statusCode: 200,
      body: cart,
    }).as("getCart");

    cy.intercept("GET", "**/api/vouchers/active", {
      statusCode: vouchersStatusCode,
      body: vouchersBody,
    }).as("getVouchers");

    cy.intercept("POST", "**/api/orders", {
      statusCode: orderStatusCode,
      body: orderBody,
    }).as("checkoutOrder");

    cy.intercept("POST", "**/api/payments/mock-wallet/create", {
      statusCode: walletStatusCode,
      body: walletBody,
    }).as("createMockWallet");

    visitCheckoutPage({ selectedProductIds });
    waitForCheckoutData();
  };

  const selectPaymentMethod = (methodName) => {
    cy.contains("strong", methodName)
      .closest("label")
      .click();
  };

  const applyVoucher = (code) => {
    cy.get('input[placeholder="Nhập mã voucher"]').clear().type(code);
    cy.contains("button", "Áp mã").click();
  };

  const submitCheckout = (buttonLabel = "Đặt hàng") => {
    cy.contains('button[type="submit"]', buttonLabel).click();
  };

  const fillShippingForm = ({
    name = "Alice",
    phone = "0123",
    address = "123 Beauty Street",
  } = {}) => {
    cy.contains("label", "Họ tên người nhận").find("input").clear().type(name);
    cy.contains("label", "Số điện thoại").find("input").clear().type(phone);
    cy.contains("label", "Địa chỉ nhập thủ công").find("textarea").clear().type(address);
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV0: Khách chưa đăng nhập truy cập checkout sẽ bị chuyển hướng đến trang đăng nhập", () => {
    cy.mockCatalog();

    cy.visit("/checkout");

    cy.url().should("eq", loginUrl);
    cy.contains('button[type="submit"]', "Đăng nhập").should("be.visible");
  });

  it("DV1: Trang checkout hiển thị các khu vực giao hàng, voucher, thanh toán và tổng kết", () => {
    mockCheckoutPage();

    cy.contains("h1", "Thanh toán đơn hàng").should("be.visible");
    cy.contains("h2", "Chọn từ tài khoản hoặc chỉnh sửa").should("exist");
    cy.contains("h2", "Áp ưu đãi cho đơn hàng").should("exist");
    cy.contains("h2", "Chọn cách bạn muốn thanh toán").should("exist");
    cy.contains("p", "Tóm tắt thanh toán").should("exist");
    cy.contains("Radiance Glow Serum").should("exist");
    cy.contains("Velvet Matte Lipstick").should("exist");
  });

  it("DV2: Tùy chọn ZaloPay được hiển thị nhưng bị vô hiệu trong chế độ demo", () => {
    mockCheckoutPage();

    cy.contains("strong", "ZaloPay")
      .closest("label")
      .find('input[type="radio"]')
      .should("be.disabled");
  });

  it("API1: Sử dụng thông tin tài khoản sẽ tự điền tên người nhận, số điện thoại và địa chỉ", () => {
    mockCheckoutPage();

    cy.contains("span", "Dùng thông tin trong tài khoản của tôi")
      .closest("label")
      .find('input[type="checkbox"]')
      .click();

    cy.contains("label", "Họ tên người nhận")
      .find("input")
      .should("have.value", "Alice");

    cy.contains("label", "Số điện thoại")
      .find("input")
      .should("have.value", "0123");

    cy.contains("label", "Địa chỉ nhập thủ công")
      .find("textarea")
      .should("have.value", "123 Beauty Street");
  });

  it("API1B: Bỏ chọn thông tin tài khoản sẽ xóa lại biểu mẫu giao hàng", () => {
    mockCheckoutPage();

    cy.contains("span", "Dùng thông tin trong tài khoản của tôi")
      .closest("label")
      .find('input[type="checkbox"]')
      .click()
      .click();

    cy.contains("label", "Họ tên người nhận")
      .find("input")
      .should("have.value", "");

    cy.contains("label", "Số điện thoại")
      .find("input")
      .should("have.value", "");

    cy.contains("label", "Địa chỉ nhập thủ công")
      .find("textarea")
      .should("have.value", "");
  });

  it("API2: Áp dụng voucher hợp lệ sẽ cập nhật mức giảm và tổng tiền cuối cùng", () => {
    mockCheckoutPage();

    fillShippingForm();
    applyVoucher("SAVE50");

    cy.contains(".toast", "Đã áp dụng mã SAVE50").should("exist");
    expectCheckoutSummaryLine("Giảm giá", `-${formatCurrency(50000)}`);
    expectCheckoutSummaryTotal(747000);
  });

  it("API3: Bấm nút voucher gợi ý sẽ áp dụng trực tiếp voucher đó", () => {
    mockCheckoutPage();

    cy.contains(".fashion-coupon-suggest button", "SAVE50").click();

    cy.get('input[placeholder="Nhập mã voucher"]')
      .should("have.value", "SAVE50");

    expectCheckoutSummaryTotal(747000);
  });

  it("API3B: Voucher gợi ý dưới mức đơn hàng tối thiểu sẽ báo lỗi và không được áp dụng", () => {
    mockCheckoutPage({ selectedProductIds: [2] });

    cy.contains(".fashion-coupon-suggest button", "VIP20").click();

    cy.contains(".toast", "Đơn tối thiểu").should("exist");

    cy.get('input[placeholder="Nhập mã voucher"]')
      .should("have.value", "VIP20");

    expectCheckoutSummaryTotal(199000);

    cy.contains(".fashion-coupon-suggest button.active", "VIP20")
      .should("not.exist");
  });

  it("API4: Checkout COD sẽ gửi yêu cầu tạo đơn, xóa các sản phẩm đã chọn và chuyển hướng đến trang đơn hàng", () => {
    mockCheckoutPage();

    fillShippingForm();
    selectPaymentMethod("Thanh toán khi nhận hàng");

    submitCheckout();

    cy.wait("@checkoutOrder").its("request.body").should("deep.equal", {
      address: "Người nhận: Alice\nĐịa chỉ: 123 Beauty Street",
      phone: "0123",
      paymentMethod: "Thanh toán khi nhận hàng",
      discountCode: "",
      selectedProductIds: [1, 2],
    });

    cy.url().should("eq", ordersUrl);
    cy.contains(".toast", "Đặt hàng thành công").should("exist");

    cy.window().then((window) => {
      expect(window.sessionStorage.getItem("dolia_checkout_product_ids")).to.equal(null);
    });
  });

  it("API4B: Voucher đã áp dụng được đưa vào yêu cầu checkout COD", () => {
    mockCheckoutPage();

    fillShippingForm();
    applyVoucher("SAVE50");
    selectPaymentMethod("Thanh toán khi nhận hàng");

    submitCheckout();

    cy.wait("@checkoutOrder").its("request.body").should("deep.equal", {
      address: "Người nhận: Alice\nĐịa chỉ: 123 Beauty Street",
      phone: "0123",
      paymentMethod: "Thanh toán khi nhận hàng",
      discountCode: "SAVE50",
      selectedProductIds: [1, 2],
    });
  });

  it("API5: Checkout bằng ví mô phỏng sẽ tạo giao dịch thanh toán và lưu khoản thanh toán đang chờ", () => {
    mockCheckoutPage();

    fillShippingForm();
    submitCheckout();

    cy.wait("@createMockWallet").its("request.body").should("deep.equal", {
      address: "Người nhận: Alice\nĐịa chỉ: 123 Beauty Street",
      phone: "0123",
      discountCode: "",
      selectedProductIds: [1, 2],
    });

    cy.window().then((window) => {
      const pending = JSON.parse(window.sessionStorage.getItem("dolia_pending_payment"));
      expect(pending).to.deep.equal({
        gateway: "mockwallet",
        transactionCode: "mockwallet_2_123456",
        amount: 747000,
      });
    });
  });

  it("API5B: Checkout bằng ví mô phỏng sẽ chuyển hướng người dùng đến trang ví demo", () => {
    mockCheckoutPage();

    fillShippingForm();
    submitCheckout();

    cy.wait("@createMockWallet");
    cy.url().should("eq", "http://localhost:5173/mock-wallet?transactionCode=mockwallet_2_123456");
  });

  it("VAL1: Voucher không hợp lệ sẽ hiển thị toast lỗi và không thay đổi tổng tiền", () => {
    mockCheckoutPage();

    applyVoucher("INVALID");

    cy.contains(".toast", "Mã giảm giá không hợp lệ").should("exist");
    expectCheckoutSummaryTotal(797000);
  });

  it("VAL2: Voucher dưới mức đơn hàng tối thiểu sẽ bị từ chối", () => {
    mockCheckoutPage({ selectedProductIds: [2] });

    applyVoucher("VIP20");

    cy.contains(".toast", "Đơn tối thiểu").should("exist");
    expectCheckoutSummaryTotal(199000);
  });

  it("VAL3: Ô nhập mã giảm giá trống sẽ gỡ voucher đã áp dụng", () => {
    mockCheckoutPage();

    applyVoucher("SAVE50");
    cy.get('input[placeholder="Nhập mã voucher"]').clear();
    cy.contains("button", "Áp mã").click();

    cy.contains(".toast", "Đã bỏ mã giảm giá").should("exist");
    expectCheckoutSummaryLine("Giảm giá", `-${formatCurrency(0)}`);
    expectCheckoutSummaryTotal(797000);
  });

  it("VAL4: Thiếu thông tin giao hàng sẽ chặn thao tác checkout", () => {
    mockCheckoutPage();

    submitCheckout();

    cy.contains(".toast", "Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ").should("exist");
    cy.url().should("eq", checkoutUrl);
  });

  it("VAL5: Các trường giao hàng chỉ chứa khoảng trắng vẫn bị chặn checkout", () => {
    mockCheckoutPage();

    fillShippingForm({
      name: "   ",
      phone: "   ",
      address: "   ",
    });
    submitCheckout();

    cy.contains(".toast", "Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ").should("exist");
    cy.url().should("eq", checkoutUrl);
  });

  it("NEG1: Checkout khi chưa chọn sản phẩm trong giỏ sẽ chuyển người dùng về lại giỏ hàng", () => {
    mockCheckoutPage({ selectedProductIds: [] });

    fillShippingForm();
    submitCheckout();

    cy.contains(".toast", "Không có sản phẩm nào để thanh toán").should("exist");
    cy.url().should("eq", cartUrl);
  });

  it("NEG2: Checkout thất bại từ backend sẽ hiển thị toast lỗi và giữ người dùng ở trang checkout", () => {
    mockCheckoutPage({
      orderStatusCode: 400,
      orderBody: { message: "Insufficient stock for Radiance Glow Serum" },
    });

    fillShippingForm();
    selectPaymentMethod("Thanh toán khi nhận hàng");
    submitCheckout();

    cy.wait("@checkoutOrder");
    cy.contains(".toast", "Insufficient stock for Radiance Glow Serum").should("exist");
    cy.url().should("eq", checkoutUrl);
  });

  it("NEG3: Tạo giao dịch ví mô phỏng thất bại sẽ hiển thị toast lỗi và giữ người dùng ở trang checkout", () => {
    mockCheckoutPage({
      walletStatusCode: 500,
      walletBody: { message: "Mock wallet service unavailable" },
    });

    fillShippingForm();
    submitCheckout();

    cy.wait("@createMockWallet");
    cy.contains(".toast", "Mock wallet service unavailable").should("exist");
    cy.url().should("eq", checkoutUrl);

    cy.window().then((window) => {
      expect(window.sessionStorage.getItem("dolia_pending_payment")).to.equal(null);
    });
  });

  it("NEG4: API voucher lỗi không chặn quá trình checkout COD", () => {
    mockCheckoutPage({
      vouchersStatusCode: 500,
      vouchersBody: { message: "Voucher service unavailable" },
      orderBody: {
        id: 10,
        total_price: 797000,
        status: "pending",
      },
    });

    cy.get(".fashion-coupon-suggest button").should("have.length", 0);

    fillShippingForm();
    selectPaymentMethod("Thanh toán khi nhận hàng");
    submitCheckout();

    cy.wait("@checkoutOrder").its("request.body").should("deep.equal", {
      address: "Người nhận: Alice\nĐịa chỉ: 123 Beauty Street",
      phone: "0123",
      paymentMethod: "Thanh toán khi nhận hàng",
      discountCode: "",
      selectedProductIds: [1, 2],
    });
    cy.url().should("eq", ordersUrl);
  });

  it("E2E1: Người dùng có thể hoàn tất checkout chuyển khoản với các sản phẩm đã chọn", () => {
    mockCheckoutPage({ selectedProductIds: [1] });

    fillShippingForm({
      name: "Alice Nguyen",
      phone: "0988888888",
      address: "48 Nguyen Trai, Quan 1",
    });

    selectPaymentMethod("Chuyển khoản ngân hàng");

    cy.contains("TRAN ANH TUYET").should("exist");
    submitCheckout();

    cy.wait("@checkoutOrder").its("request.body").should("deep.equal", {
      address: "Người nhận: Alice Nguyen\nĐịa chỉ: 48 Nguyen Trai, Quan 1",
      phone: "0988888888",
      paymentMethod: "Chuyển khoản ngân hàng",
      discountCode: "",
      selectedProductIds: [1],
    });

    cy.url().should("eq", ordersUrl);
  });
});
