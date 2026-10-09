describe("Dolia Shop - Kiểm thử tìm kiếm và bộ lọc", () => {
  const user = {
    id: 2,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    phone: "0123",
    address: "123 Beauty Street",
  };

  const admin = {
    id: 1,
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
  };

  const cart = {
    id: 1,
    user_id: 2,
    items: [],
    totalPrice: 0,
  };

  const categoryProducts = [
    {
      id: 1,
      name: "Radiance Glow Serum",
      price: 299000,
      description: "Vitamin C serum for brighter skin.",
      image: "https://images.example.com/serum.jpg",
      stock: 25,
      category_id: 1,
      category: { id: 1, name: "Skincare" },
    },
    {
      id: 3,
      name: "Hydra Calm Cream",
      price: 499000,
      description: "Daily moisturizing cream.",
      image: "https://images.example.com/cream.jpg",
      stock: 10,
      category_id: 1,
      category: { id: 1, name: "Skincare" },
    },
    {
      id: 4,
      name: "Aloe Fresh Gel",
      price: 199000,
      description: "Cooling soothing gel.",
      image: "https://images.example.com/gel.jpg",
      stock: 15,
      category_id: 1,
      category: { id: 1, name: "Skincare" },
    },
  ];

  const reportOrders = [
    {
      id: 10,
      created_at: "2026-05-02T10:00:00.000Z",
      total_price: 747000,
      status: "pending",
      paymentTransaction: { status: "pending", gateway: "bank_transfer" },
      items: [{ product_id: 1, quantity: 1, price: 747000, product: { name: "Radiance Glow Serum", image: "https://images.example.com/serum.jpg" } }],
      user: { id: 2, name: "Alice", email: "alice@example.com" },
    },
    {
      id: 11,
      created_at: "2026-05-15T10:00:00.000Z",
      total_price: 399000,
      status: "delivered",
      paymentTransaction: { status: "paid", gateway: "cod" },
      items: [{ product_id: 3, quantity: 1, price: 399000, product: { name: "Hydra Calm Cream", image: "https://images.example.com/cream.jpg" } }],
      user: { id: 2, name: "Alice", email: "alice@example.com" },
    },
    {
      id: 12,
      created_at: "2026-04-12T10:00:00.000Z",
      total_price: 520000,
      status: "shipping",
      paymentTransaction: { status: "paid", gateway: "mockwallet" },
      items: [{ product_id: 4, quantity: 2, price: 260000, product: { name: "Aloe Fresh Gel", image: "https://images.example.com/gel.jpg" } }],
      user: { id: 3, name: "Bob", email: "bob@example.com" },
    },
    {
      id: 13,
      created_at: "2025-12-30T10:00:00.000Z",
      total_price: 610000,
      status: "cancelled",
      paymentTransaction: { status: "failed", gateway: "zalopay" },
      items: [{ product_id: 2, quantity: 1, price: 610000, product: { name: "Velvet Matte Lipstick", image: "https://images.example.com/lipstick.jpg" } }],
      user: { id: 4, name: "Cara", email: "cara@example.com" },
    },
  ];

  const reportProducts = [
    { id: 1, name: "Radiance Glow Serum", stock: 25, image: "https://images.example.com/serum.jpg" },
    { id: 3, name: "Hydra Calm Cream", stock: 10, image: "https://images.example.com/cream.jpg" },
    { id: 4, name: "Aloe Fresh Gel", stock: 8, image: "https://images.example.com/gel.jpg" },
  ];

  const users = [
    admin,
    user,
    { id: 3, name: "Bob", email: "bob@example.com", role: "user" },
    { id: 4, name: "Cara", email: "cara@example.com", role: "user" },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const mockCategoryPage = ({ asUser = false } = {}) => {
    cy.fixture("catalog.json").then((catalog) => {
      const categories = catalog.categories;

      cy.intercept("GET", "**/api/categories", {
        statusCode: 200,
        body: categories,
      }).as("getCategories");

      cy.intercept("GET", /\/api\/products.*/, {
        statusCode: 200,
        body: {
          products: categoryProducts,
          pagination: {
            page: 1,
            limit: 8,
            totalItems: categoryProducts.length,
            totalPages: 1,
          },
        },
      }).as("getCategoryProducts");

      cy.intercept("POST", "**/api/cart/add", {
        statusCode: 200,
        body: {
          ...cart,
          items: [
            {
              id: 1,
              product_id: 1,
              quantity: 1,
              product: {
                id: 1,
                name: "Radiance Glow Serum",
                price: 299000,
                image: "https://images.example.com/serum.jpg",
              },
            },
          ],
          totalPrice: 299000,
        },
      }).as("addToCart");

      cy.intercept("GET", "**/api/cart", {
        statusCode: 200,
        body: cart,
      }).as("getCart");

      cy.visit("/categories/1", {
        onBeforeLoad(window) {
          if (asUser) {
            window.localStorage.setItem("token", "mock-user-token");
            window.localStorage.setItem("user", JSON.stringify(user));
          }
        },
      });
    });
  };

  const mockProductDetailPage = () => {
    cy.fixture("catalog.json").then((catalog) => {
      cy.intercept("GET", "**/api/users/2", {
        statusCode: 200,
        body: user,
      }).as("getCurrentUser");

      cy.intercept("GET", "**/api/products/1", {
        statusCode: 200,
        body: {
          ...catalog.products[0],
          price: 299000,
          stock: 25,
        },
      }).as("getProduct");

      cy.intercept("GET", "**/api/cart", {
        statusCode: 200,
        body: cart,
      }).as("getCart");

      cy.visit("/products/1", {
        onBeforeLoad(window) {
          window.localStorage.setItem("token", "mock-user-token");
          window.localStorage.setItem("user", JSON.stringify(user));
        },
      });
    });
  };

  const mockReportPage = () => {
    cy.intercept("GET", "**/api/users/1", {
      statusCode: 200,
      body: admin,
    }).as("getAdminUser");

    cy.intercept("GET", "**/api/orders/admin", {
      statusCode: 200,
      body: reportOrders,
    }).as("getAdminOrders");

    cy.intercept("GET", /\/api\/products.*/, {
      statusCode: 200,
      body: {
        products: reportProducts,
        pagination: {
          page: 1,
          limit: 100,
          totalItems: reportProducts.length,
          totalPages: 1,
        },
      },
    }).as("getAdminProducts");

    cy.intercept("GET", "**/api/users", {
      statusCode: 200,
      body: users,
    }).as("getUsers");

    cy.visit("/admin/reports", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "mock-admin-token");
        window.localStorage.setItem("user", JSON.stringify(admin));
      },
    });

    cy.wait("@getAdminUser");
    cy.wait("@getAdminOrders");
    cy.wait("@getAdminProducts");
    cy.wait("@getUsers");
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("SEARCH1: Từ khóa tìm kiếm ở trang chủ cập nhật URL và tải lại sản phẩm theo từ khóa", () => {
    cy.fixture("catalog.json").then((catalog) => {
      cy.intercept("GET", "**/api/categories", {
        statusCode: 200,
        body: catalog.categories,
      }).as("getCategories");

      cy.intercept("GET", /\/api\/products.*/, {
        statusCode: 200,
        body: {
          products: catalog.products,
          pagination: {
            page: 1,
            limit: 12,
            totalItems: catalog.products.length,
            totalPages: 1,
          },
        },
      }).as("getProducts");

      cy.visit("/");
    });

    cy.wait("@getProducts");
    cy.get('.fashion-search input[type="search"]').type("serum");

    cy.url().should("include", "search=serum");
    cy.get("@getProducts.all").then((requests) => {
      expect(requests[requests.length - 1].request.url).to.include("search=serum");
    });
  });

  it("FILTER1: Tìm kiếm ở trang danh mục sẽ thu hẹp sản phẩm trong danh mục đã chọn", () => {
    mockCategoryPage();

    cy.wait("@getCategories");
    cy.wait("@getCategoryProducts");

    cy.get('.fashion-category-toolbar input[type="search"]').type("Hydra");

    cy.contains("Hydra Calm Cream").should("exist");
    cy.contains("Radiance Glow Serum").should("not.exist");
    cy.contains("Aloe Fresh Gel").should("not.exist");
    cy.contains(".fashion-category-tabs span", "1 sản phẩm trang này").should("exist");
  });

  it("FILTER2: Các tab danh mục chuyển đúng route của danh mục đang hoạt động", () => {
    mockCategoryPage();

    cy.wait("@getCategories");

    cy.contains(".fashion-category-tabs a", "Makeup").click();
    cy.url().should("eq", `${Cypress.config("baseUrl")}/categories/2`);
  });

  it("FILTER3: Sắp xếp giá tăng dần sẽ sắp sản phẩm từ thấp đến cao", () => {
    mockCategoryPage();

    cy.wait("@getCategoryProducts");
    cy.get(".fashion-category-toolbar select").select("Giá thấp đến cao");

    cy.get(".fashion-product-card").then((cards) => {
      const names = [...cards].map((card) => card.innerText);
      expect(names[0]).to.include("Aloe Fresh Gel");
      expect(names[1]).to.include("Radiance Glow Serum");
      expect(names[2]).to.include("Hydra Calm Cream");
    });
  });

  it("FILTER4: Sắp xếp giá giảm dần sẽ sắp sản phẩm từ cao xuống thấp", () => {
    mockCategoryPage();

    cy.wait("@getCategoryProducts");
    cy.get(".fashion-category-toolbar select").select("Giá cao đến thấp");

    cy.get(".fashion-product-card").then((cards) => {
      const names = [...cards].map((card) => card.innerText);
      expect(names[0]).to.include("Hydra Calm Cream");
      expect(names[1]).to.include("Radiance Glow Serum");
      expect(names[2]).to.include("Aloe Fresh Gel");
    });
  });

  it("FILTER5: Sắp xếp theo tên sẽ sắp sản phẩm trong danh mục theo thứ tự alphabet", () => {
    mockCategoryPage();

    cy.wait("@getCategoryProducts");
    cy.get(".fashion-category-toolbar select").select("Tên A-Z");

    cy.get(".fashion-product-card").then((cards) => {
      const names = [...cards].map((card) => card.innerText);
      expect(names[0]).to.include("Aloe Fresh Gel");
      expect(names[1]).to.include("Hydra Calm Cream");
      expect(names[2]).to.include("Radiance Glow Serum");
    });
  });

  it("FILTER6: Trang danh mục hiển thị thống kê giá nhỏ nhất và lớn nhất cho danh sách hiện tại", () => {
    mockCategoryPage();

    cy.wait("@getCategoryProducts");

    cy.contains(".fashion-category-stats article", "Giá từ")
      .should("contain.text", formatCurrency(199000));
    cy.contains(".fashion-category-stats article", "Cao nhất")
      .should("contain.text", formatCurrency(499000));
  });

  it("FILTER7: Trang chi tiết sản phẩm cho phép người dùng chọn thuộc tính kích cỡ và màu sắc", () => {
    mockProductDetailPage();

    cy.wait("@getCurrentUser");
    cy.wait("@getCart");
    cy.wait("@getProduct");

    cy.contains(".fashion-size-list button", "XL").click();
    cy.get('.fashion-color-list button[aria-label="Đỏ rượu"]').click();

    cy.contains("span", "Đang chọn size XL").should("exist");
    cy.get('.fashion-color-list button[aria-label="Đỏ rượu"]')
      .should("have.class", "active");
  });

  it("FILTER8: Trang báo cáo có thể lọc đơn hàng theo một ngày cụ thể", () => {
    mockReportPage();

    cy.get(".admin-report-actions select").select("Theo ngày");
    cy.get('.admin-report-filter-card input[type="date"]').clear().type("2026-05-15");

    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", formatCurrency(399000));
    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", "1 đơn hàng");
  });

  it("FILTER9: Trang báo cáo có thể lọc đơn hàng theo tháng", () => {
    mockReportPage();

    cy.get(".admin-report-actions select").select("Theo tháng");
    cy.get('.admin-report-filter-card input[type="month"]').clear().type("2026-04");

    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", formatCurrency(520000));
    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", "1 đơn hàng");
  });

  it("FILTER10: Trang báo cáo có thể lọc đơn hàng theo năm", () => {
    mockReportPage();

    cy.get(".admin-report-actions select").select("Theo năm");
    cy.get('.admin-report-filter-card select').last().select("2025");

    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", formatCurrency(610000));
    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", "1 đơn hàng");
  });

  it("FILTER11: Trang báo cáo có thể lọc đơn hàng theo khoảng ngày tùy chọn", () => {
    mockReportPage();

    cy.get(".admin-report-actions select").select("Tự chọn ngày");
    cy.get('.admin-report-filter-card input[type="date"]').eq(0).clear().type("2026-05-01");
    cy.get('.admin-report-filter-card input[type="date"]').eq(1).clear().type("2026-05-31");

    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", formatCurrency(1146000));
    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận")
      .should("contain.text", "2 đơn hàng");
  });
});
