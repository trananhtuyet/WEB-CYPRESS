const admin = {
  id: 1,
  name: "Admin",
  email: "admin@cosmetics.local",
  role: "admin",
};

const categories = [
  { id: 1, name: "Áo" },
  { id: 2, name: "Quần" },
  { id: 3, name: "Giày" },
];

const baseProducts = [
  {
    id: 1,
    name: "Dolia Blazer Modern",
    price: 1290000,
    description: "Blazer phom đứng cho công sở.",
    stock: 8,
    category_id: 1,
    category: { id: 1, name: "Áo" },
    image: "https://images.example.com/blazer.jpg",
  },
  {
    id: 2,
    name: "Dolia Denim Relaxed",
    price: 890000,
    description: "Quần denim form suông.",
    stock: 24,
    category_id: 2,
    category: { id: 2, name: "Quần" },
    image: "https://images.example.com/denim.jpg",
  },
  {
    id: 3,
    name: "Dolia Street Sneaker",
    price: 1450000,
    description: "Giày sneaker cổ thấp.",
    stock: 4,
    category_id: 3,
    category: { id: 3, name: "Giày" },
    image: "https://images.example.com/sneaker.jpg",
  },
];

const baseUsers = [
  {
    id: 1,
    name: "Admin",
    email: "admin@cosmetics.local",
    role: "admin",
    created_at: "2026-05-01T08:00:00.000Z",
  },
  {
    id: 2,
    name: "Alice Nguyen",
    email: "alice@example.com",
    phone: "0900000001",
    role: "user",
    created_at: "2026-05-11T08:00:00.000Z",
  },
  {
    id: 3,
    name: "Minh Tran",
    email: "minh@example.com",
    phone: "0900000002",
    role: "user",
    created_at: "2026-04-18T08:00:00.000Z",
  },
];

const baseOrders = [
  {
    id: 10,
    user_id: 2,
    user: { id: 2, name: "Alice Nguyen", email: "alice@example.com" },
    total_price: 2580000,
    status: "pending",
    address: "Người nhận: Alice Nguyen\nĐịa chỉ: 12 Nguyễn Trãi, Quận 1",
    created_at: "2026-05-17T09:00:00.000Z",
    paymentTransaction: {
      gateway: "mockwallet",
      status: "processing",
      transaction_code: "MW-0010",
    },
    items: [
      {
        id: 501,
        product_id: 1,
        quantity: 1,
        price: 1290000,
        product: {
          id: 1,
          name: "Dolia Blazer Modern",
          image: "https://images.example.com/blazer.jpg",
        },
      },
      {
        id: 502,
        product_id: 2,
        quantity: 1,
        price: 1290000,
        product: {
          id: 2,
          name: "Dolia Denim Relaxed",
          image: "https://images.example.com/denim.jpg",
        },
      },
    ],
  },
  {
    id: 11,
    user_id: 3,
    user: { id: 3, name: "Minh Tran", email: "minh@example.com" },
    total_price: 1450000,
    status: "shipping",
    address: "Người nhận: Minh Tran\nĐịa chỉ: 24 Lê Lợi, Quận 3",
    created_at: "2026-05-18T10:30:00.000Z",
    paymentTransaction: {
      gateway: "cod",
      status: "unpaid",
      transaction_code: "COD-0011",
    },
    items: [
      {
        id: 503,
        product_id: 3,
        quantity: 1,
        price: 1450000,
        product: {
          id: 3,
          name: "Dolia Street Sneaker",
          image: "https://images.example.com/sneaker.jpg",
        },
      },
    ],
  },
];

const baseContacts = [
  {
    id: 1001,
    name: "Alice Nguyen",
    phone: "0900000001",
    email: "alice@example.com",
    topic: "Hỗ trợ đơn hàng",
    message: "Mình muốn cập nhật thời gian giao hàng.",
    status: "new",
    createdAt: Date.parse("2026-05-18T08:30:00.000Z"),
    customerReplies: [],
    replies: [],
  },
  {
    id: 1002,
    name: "Minh Tran",
    phone: "0900000002",
    email: "minh@example.com",
    topic: "Đổi trả",
    message: "Mình cần hướng dẫn đổi size.",
    status: "replied",
    createdAt: Date.parse("2026-05-16T07:30:00.000Z"),
    customerReplies: [],
    replies: [
      {
        text: "Shop đã gửi hướng dẫn đổi size qua email.",
        createdAt: Date.parse("2026-05-16T09:00:00.000Z"),
      },
    ],
  },
];

const baseVouchers = [
  {
    id: 201,
    code: "SAVE10",
    name: "Giảm 10% đơn đầu",
    type: "percent",
    value: 10,
    min_order_amount: 500000,
    max_discount_amount: 100000,
    usage_limit: 100,
    used_count: 12,
    starts_at: "2026-05-01T00:00:00.000Z",
    ends_at: "2026-06-30T23:59:59.000Z",
    is_active: true,
  },
  {
    id: 202,
    code: "SHIPFREE",
    name: "Miễn phí vận chuyển",
    type: "free_shipping",
    value: 0,
    min_order_amount: 300000,
    max_discount_amount: null,
    usage_limit: null,
    used_count: 18,
    starts_at: "2026-05-01T00:00:00.000Z",
    ends_at: "2026-07-31T23:59:59.000Z",
    is_active: true,
  },
  {
    id: 203,
    code: "VIP20",
    name: "Giảm 20% VIP",
    type: "percent",
    value: 20,
    min_order_amount: 1000000,
    max_discount_amount: 200000,
    usage_limit: 50,
    used_count: 50,
    starts_at: "2026-04-01T00:00:00.000Z",
    ends_at: "2026-04-30T23:59:59.000Z",
    is_active: false,
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const buildPaginatedProducts = (products, query = {}) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || products.length || 1);
  const start = (page - 1) * limit;
  const sliced = products.slice(start, start + limit);

  return {
    products: sliced,
    pagination: {
      page,
      limit,
      totalItems: products.length,
      totalPages: Math.max(1, Math.ceil(products.length / limit)),
    },
  };
};

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
  expect(body).to.include(String(expectedValue));
};

const mockAdminWorkspace = (path = "/admin", options = {}) => {
  const {
    users = baseUsers,
    products = baseProducts,
    orders = baseOrders,
    contacts = baseContacts,
    vouchers = baseVouchers,
    categoryList = categories,
    getUsersStatusCode = 200,
    getUsersBody,
    getCategoriesStatusCode = 200,
    getCategoriesBody,
    getProductsStatusCode = 200,
    getProductsBody,
    getAdminOrdersStatusCode = 200,
    getAdminOrdersBody,
    getAdminContactsStatusCode = 200,
    getAdminContactsBody,
    getAdminVouchersStatusCode = 200,
    getAdminVouchersBody,
    healthStatusCode = 200,
    healthBody = { message: "API đang hoạt động" },
    createProductStatusCode = 201,
    createProductBody,
    updateProductStatusCode = 200,
    updateProductBody,
    deleteProductStatusCode = 200,
    deleteProductBody,
    updateOrderStatusCode = 200,
    updateOrderStatusBody,
    updateOrderStatusErrorBody,
    updateOrderStatusResponse,
    updateOrderCode = 200,
    updateOrderBody,
    updateOrderErrorBody,
    updateOrderResponse,
    confirmOrderPaymentStatusCode = 200,
    confirmOrderPaymentBody,
    confirmOrderPaymentErrorBody,
    confirmOrderPaymentResponse,
    addAdminReplyStatusCode = 200,
    addAdminReplyBody,
    addAdminReplyErrorBody,
    addAdminReplyResponse,
    updateContactStatusCode = 200,
    updateContactStatusBody,
    updateContactStatusErrorBody,
    updateContactStatusResponse,
    createVoucherStatusCode = 201,
    createVoucherBody,
    createVoucherErrorBody,
    updateVoucherStatusCode = 200,
    updateVoucherBody,
    updateVoucherErrorBody,
    deleteVoucherStatusCode = 200,
    deleteVoucherBody,
    deleteVoucherErrorBody,
    onBeforeLoad,
  } = options;

  const state = {
    products: clone(products),
    users: clone(users),
    orders: clone(orders),
    contacts: clone(contacts),
    vouchers: clone(vouchers),
    nextProductId: 20,
    nextVoucherId: 300,
  };

  cy.intercept("GET", "**/api/users/1", {
    statusCode: 200,
    body: admin,
  }).as("getAdminUser");

  cy.intercept("GET", "**/api/users", (req) => {
    req.reply({
      statusCode: getUsersStatusCode,
      body: getUsersBody ?? state.users,
    });
  }).as("getUsers");

  cy.intercept("GET", "**/api/categories", {
    statusCode: getCategoriesStatusCode,
    body: getCategoriesBody ?? categoryList,
  }).as("getCategories");

  cy.intercept("GET", /\/api\/products.*/, (req) => {
    req.reply({
      statusCode: getProductsStatusCode,
      body: getProductsBody ?? buildPaginatedProducts(state.products, req.query),
    });
  }).as("getProducts");

  cy.intercept("POST", "**/api/products", (req) => {
    const nextProduct = createProductBody ?? {
      id: state.nextProductId++,
      name: "Dolia Linen Shirt",
      price: 990000,
      description: "Áo linen mùa hè.",
      stock: 16,
      category_id: 1,
      category: categoryList[0],
      image: "https://images.example.com/linen-shirt.jpg",
    };

    if (createProductStatusCode < 400) {
      state.products.unshift(nextProduct);
    }
    req.reply({
      statusCode: createProductStatusCode,
      body: nextProduct,
    });
  }).as("createProduct");

  cy.intercept("PUT", /\/api\/products\/\d+/, (req) => {
    const id = Number(req.url.split("/").pop());
    if (updateProductStatusCode < 400) {
      state.products = state.products.map((product) =>
        product.id === id
          ? {
              ...product,
              ...(updateProductBody ?? {
                name: "Dolia Denim Relaxed Updated",
                price: 910000,
                description: "Quần denim form suông đã cập nhật.",
                stock: 18,
                category_id: 2,
                category: categoryList[1],
              }),
            }
          : product
      );
    }

    req.reply({
      statusCode: updateProductStatusCode,
      body: updateProductStatusCode < 400
        ? state.products.find((product) => product.id === id)
        : (updateProductBody ?? { message: "Failed to save product" }),
    });
  }).as("updateProduct");

  cy.intercept("DELETE", /\/api\/products\/\d+/, (req) => {
    const id = Number(req.url.split("/").pop());
    if (deleteProductStatusCode < 400) {
      state.products = state.products.filter((product) => product.id !== id);
    }
    req.reply({
      statusCode: deleteProductStatusCode,
      body: deleteProductBody ?? { message: "deleted" },
    });
  }).as("deleteProduct");

  cy.intercept("GET", "**/api/orders/admin", (req) => {
    req.reply({
      statusCode: getAdminOrdersStatusCode,
      body: getAdminOrdersBody ?? state.orders,
    });
  }).as("getAdminOrders");

  cy.intercept("PUT", /\/api\/orders\/\d+\/status/, (req) => {
    const id = Number(req.url.split("/").slice(-2, -1)[0]);
    if (updateOrderStatusCode < 400) {
      state.orders = state.orders.map((order) =>
        order.id === id ? { ...order, ...(updateOrderStatusResponse ?? { status: req.body.status }) } : order
      );
    }

    req.reply({
      statusCode: updateOrderStatusCode,
      body: updateOrderStatusCode < 400
        ? (updateOrderStatusBody ?? state.orders.find((order) => order.id === id))
        : (updateOrderStatusErrorBody ?? { message: "Không thể lưu tình trạng đơn hàng" }),
    });
  }).as("updateOrderStatus");

  cy.intercept("PUT", /\/api\/orders\/\d+$/, (req) => {
    const id = Number(req.url.split("/").pop());
    if (updateOrderCode < 400) {
      state.orders = state.orders.map((order) =>
        order.id === id ? { ...order, ...(updateOrderResponse ?? { status: req.body.status }) } : order
      );
    }

    req.reply({
      statusCode: updateOrderCode,
      body: updateOrderCode < 400
        ? (updateOrderBody ?? state.orders.find((order) => order.id === id))
        : (updateOrderErrorBody ?? { message: "Không thể cập nhật đơn hàng" }),
    });
  }).as("updateOrder");

  cy.intercept("POST", /\/api\/payments\/orders\/\d+\/confirm/, (req) => {
    const id = Number(req.url.split("/").slice(-2, -1)[0]);
    if (confirmOrderPaymentStatusCode < 400) {
      state.orders = state.orders.map((order) =>
        order.id === id
          ? {
              ...order,
              ...(confirmOrderPaymentResponse ?? {
                paymentTransaction: {
                  ...order.paymentTransaction,
                  status: "paid",
                },
              }),
            }
          : order
      );
    }

    req.reply({
      statusCode: confirmOrderPaymentStatusCode,
      body: confirmOrderPaymentStatusCode < 400
        ? (confirmOrderPaymentBody ?? state.orders.find((order) => order.id === id))
        : (confirmOrderPaymentErrorBody ?? { message: "Không thể xác nhận thanh toán" }),
    });
  }).as("confirmOrderPayment");

  cy.intercept("GET", "**/api/contacts", (req) => {
    req.reply({
      statusCode: getAdminContactsStatusCode,
      body: getAdminContactsBody ?? state.contacts,
    });
  }).as("getAdminContacts");

  cy.intercept("GET", "**/api/vouchers", (req) => {
    req.reply({
      statusCode: getAdminVouchersStatusCode,
      body: getAdminVouchersBody ?? state.vouchers,
    });
  }).as("getAdminVouchers");

  cy.intercept("POST", /\/api\/contacts\/\d+\/replies/, (req) => {
    const id = Number(req.url.split("/").slice(-2, -1)[0]);
    if (addAdminReplyStatusCode < 400) {
      state.contacts = state.contacts.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              ...(addAdminReplyResponse ?? {
                status: "replied",
                replies: [...(contact.replies || []), { text: req.body.text, createdAt: Date.now() }],
              }),
            }
          : contact
      );
    }

    req.reply({
      statusCode: addAdminReplyStatusCode,
      body: addAdminReplyStatusCode < 400
        ? (addAdminReplyBody ?? state.contacts.find((contact) => contact.id === id))
        : (addAdminReplyErrorBody ?? { message: "Không lưu được phản hồi vào database" }),
    });
  }).as("addAdminReply");

  cy.intercept("PATCH", /\/api\/contacts\/\d+\/status/, (req) => {
    const id = Number(req.url.split("/").slice(-2, -1)[0]);
    if (updateContactStatusCode < 400) {
      state.contacts = state.contacts.map((contact) =>
        contact.id === id ? { ...contact, ...(updateContactStatusResponse ?? { status: req.body.status }) } : contact
      );
    }

    req.reply({
      statusCode: updateContactStatusCode,
      body: updateContactStatusCode < 400
        ? (updateContactStatusBody ?? state.contacts.find((contact) => contact.id === id))
        : (updateContactStatusErrorBody ?? { message: "Không cập nhật được trạng thái liên hệ" }),
    });
  }).as("updateContactStatus");

  cy.intercept("POST", "**/api/vouchers", (req) => {
    const nextVoucher = createVoucherBody ?? {
      id: state.nextVoucherId++,
      code: "SUMMER20",
      name: "Giảm mùa hè",
      type: "percent",
      value: 20,
      min_order_amount: 400000,
      max_discount_amount: 120000,
      usage_limit: 80,
      used_count: 0,
      starts_at: "2026-06-01T00:00:00.000Z",
      ends_at: "2026-07-15T23:59:59.000Z",
      is_active: true,
    };

    if (createVoucherStatusCode < 400) {
      state.vouchers.unshift(nextVoucher);
    }

    req.reply({
      statusCode: createVoucherStatusCode,
      body: createVoucherStatusCode < 400
        ? nextVoucher
        : (createVoucherErrorBody ?? { message: "Không thể lưu voucher" }),
    });
  }).as("createVoucher");

  cy.intercept("PUT", /\/api\/vouchers\/\d+$/, (req) => {
    const id = Number(req.url.split("/").pop());
    if (updateVoucherStatusCode < 400) {
      state.vouchers = state.vouchers.map((voucher) =>
        voucher.id === id
          ? {
              ...voucher,
              ...(updateVoucherBody ?? {
                name: "Voucher đã cập nhật",
                code: "SAVE15",
                value: 15,
              }),
            }
          : voucher
      );
    }

    req.reply({
      statusCode: updateVoucherStatusCode,
      body: updateVoucherStatusCode < 400
        ? state.vouchers.find((voucher) => voucher.id === id)
        : (updateVoucherErrorBody ?? { message: "Không thể lưu voucher" }),
    });
  }).as("updateVoucher");

  cy.intercept("DELETE", /\/api\/vouchers\/\d+$/, (req) => {
    const id = Number(req.url.split("/").pop());
    if (deleteVoucherStatusCode < 400) {
      state.vouchers = state.vouchers.filter((voucher) => voucher.id !== id);
    }

    req.reply({
      statusCode: deleteVoucherStatusCode,
      body: deleteVoucherStatusCode < 400
        ? (deleteVoucherBody ?? { message: "deleted" })
        : (deleteVoucherErrorBody ?? { message: "Không thể xóa voucher" }),
    });
  }).as("deleteVoucher");

  cy.intercept("GET", "**/api/health", {
    statusCode: healthStatusCode,
    body: healthBody,
  }).as("getHealth");

  cy.visit(path, {
    onBeforeLoad(window) {
      window.localStorage.clear();
      window.localStorage.setItem("token", "mock-admin-token");
      window.localStorage.setItem("user", JSON.stringify(admin));
      if (typeof onBeforeLoad === "function") {
        onBeforeLoad(window);
      }
    },
  });

  cy.wait("@getAdminUser");

  return cy.wrap(state, { log: false });
};

module.exports = {
  expectRequestField,
  mockAdminWorkspace,
};
