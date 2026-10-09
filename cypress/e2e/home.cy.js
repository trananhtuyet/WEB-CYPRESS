describe("Dolia Shop - Phân hệ danh mục trang chủ", () => {
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
    items: [],
    totalPrice: 0,
  };

  const cartAfterAdd = {
    id: 1,
    user_id: 2,
    items: [
      {
        id: 1,
        product_id: 1,
        quantity: 1,
        product: {
          id: 1,
          name: "Radiance Glow Serum",
          price: 29.99,
          image: "https://images.example.com/serum.jpg",
        },
      },
    ],
    totalPrice: 29.99,
  };

  const loginUrl = `${Cypress.config("baseUrl")}/login`;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const mockHomePage = ({
    asUser = false,
    productBody,
    categoryBody,
  } = {}) => {
    cy.fixture("catalog.json").then((catalog) => {
      const categories = categoryBody || catalog.categories;
      const products = productBody || catalog.products;

      cy.intercept("GET", "**/api/categories", {
        statusCode: 200,
        body: categories,
      }).as("getCategories");

      cy.intercept("GET", /\/api\/products.*/, {
        statusCode: 200,
        body: {
          products,
          pagination: {
            page: 1,
            limit: 12,
            totalItems: products.length,
            totalPages: 1,
          },
        },
      }).as("getProducts");

      cy.intercept("POST", "**/api/cart/add", {
        statusCode: 200,
        body: cartAfterAdd,
      }).as("addToCart");

      cy.intercept("GET", "**/api/cart", {
        statusCode: 200,
        body: cart,
      }).as("getCart");

      cy.visit("/", {
        onBeforeLoad(window) {
          if (asUser) {
            window.localStorage.setItem("token", "mock-user-token");
            window.localStorage.setItem("user", JSON.stringify(user));
          }
        },
      });
    });
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang chủ hiển thị ô tìm kiếm, danh mục và các khu vực sản phẩm", () => {
    mockHomePage();

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains("a", "Trang chủ").should("exist");
    cy.contains("h2", "Danh mục nổi bật").should("be.visible");
    cy.contains("h2", "Sản phẩm mới").should("be.visible");
    cy.contains("h2", "Bán chạy nhất").should("be.visible");
    cy.get('.fashion-search input[type="search"]').should("be.visible");
    cy.contains("Radiance Glow Serum").should("exist");
    cy.contains("Velvet Matte Lipstick").should("exist");
  });

  it("DV2: Thẻ sản phẩm hiển thị ảnh, tên, giá, tồn kho và nút hành động", () => {
    mockHomePage();

    cy.wait("@getProducts");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .should("contain.text", formatCurrency(29.99))
      .and("contain.text", "25 san pham san sang")
      .and("contain.text", "Them vao tu do do");
  });

  it("API1: Từ khóa tìm kiếm sẽ cập nhật URL và tải lại sản phẩm", () => {
    mockHomePage();

    cy.wait("@getProducts");
    cy.get('.fashion-search input[type="search"]').type("serum");

    cy.url().should("include", "search=serum");
    cy.get("@getProducts.all").then((requests) => {
      expect(requests[requests.length - 1].request.url).to.include("search=serum");
    });
  });

  it("API2: Người dùng đã đăng nhập có thể thêm sản phẩm vào giỏ từ trang chủ", () => {
    mockHomePage({ asUser: true });

    cy.wait("@getCart");
    cy.wait("@getProducts");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .contains("button", "Them vao tu do do")
      .click();

    cy.wait("@addToCart").its("request.body").should("deep.equal", {
      product_id: 1,
      quantity: 1,
    });

    cy.contains(".toast", "Đã thêm vào giỏ hàng").should("exist");
    cy.contains('a[aria-label="Giỏ hàng"] span', "1").should("exist");
  });

  it("API3: Bật tắt wishlist sẽ cập nhật bộ đếm yêu thích", () => {
    mockHomePage();

    cy.contains('a[aria-label="Sản phẩm yêu thích"] span', "0").should("exist");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .find(".fashion-wishlist-button")
      .click();

    cy.contains(".toast", "Đã thêm vào yêu thích").should("exist");
    cy.contains('a[aria-label="Sản phẩm yêu thích"] span', "1").should("exist");
  });

  it("VAL1: Phản hồi sản phẩm rỗng sẽ fallback an toàn sang sản phẩm mẫu", () => {
    mockHomePage({ productBody: [] });

    cy.wait("@getProducts");

    cy.contains("h2", "Sản phẩm mới").should("be.visible");
    cy.contains("Polo Pique Classic Fit Signature").should("exist");
    cy.contains("Charles & Keith Guốc Hở Mũi Metallic").should("exist");
  });

  it("NEG1: Khách thêm vào giỏ sẽ bị chuyển hướng đến đăng nhập", () => {
    mockHomePage();

    cy.wait("@getProducts");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .contains("button", "Them vao tu do do")
      .click();

    cy.contains(".toast", "Vui lòng đăng nhập để thêm sản phẩm").should("exist");
    cy.url().should("eq", loginUrl);
  });

  it("COMMENT1: Người dùng có thể gửi bình luận trên trang chủ kèm mức đánh giá đã chọn", () => {
    mockHomePage({ asUser: true });

    cy.wait("@getCart");
    cy.wait("@getProducts");

    cy.get('.fashion-rating-picker button[aria-label="4 sao"]').click();
    cy.get(".fashion-comment-form textarea").type("Bố cục trang đẹp và sản phẩm nhìn rất ổn.");
    cy.contains('.fashion-comment-form button[type="submit"]', "Gửi bình luận").click();

    cy.contains(".toast", "Đã thêm bình luận").should("exist");
    cy.contains(".fashion-comment-list article", "Bố cục trang đẹp và sản phẩm nhìn rất ổn.").should("exist");
    cy.contains(".fashion-comment-list article strong", "Alice").should("exist");
  });

  it("COMMENT2: Bình luận trang chủ rỗng sẽ bị chặn và hiển thị toast lỗi", () => {
    mockHomePage({ asUser: true });

    cy.wait("@getCart");
    cy.wait("@getProducts");

    cy.contains('.fashion-comment-form button[type="submit"]', "Gửi bình luận").click();

    cy.contains(".toast", "Vui lòng nhập bình luận").should("exist");
  });

  it("COMMENT3: Bình luận của khách sẽ dùng tên khách hàng mặc định", () => {
    mockHomePage();

    cy.wait("@getProducts");
    cy.get('.fashion-rating-picker button[aria-label="3 sao"]').click();
    cy.get(".fashion-comment-form textarea").type("Mình là khách ghé xem và để lại bình luận.");
    cy.contains('.fashion-comment-form button[type="submit"]', "Gửi bình luận").click();

    cy.contains(".toast", "Đã thêm bình luận").should("exist");
    cy.contains(".fashion-comment-list article strong", "Khách hàng").should("exist");
  });

  it("COMMENT4: Bình luận trên trang chủ có thể mở rộng và thu gọn bằng nút chuyển đổi", () => {
    mockHomePage();

    cy.wait("@getProducts");
    cy.get(".fashion-comment-list article").should("have.length", 3);
    cy.contains(".fashion-comment-more", "Xem thêm bình luận").click();
    cy.get(".fashion-comment-list article").should("have.length.greaterThan", 3);
    cy.contains(".fashion-comment-more", "Thu gọn").click();
    cy.get(".fashion-comment-list article").should("have.length", 3);
  });

  it("E2E1: Người dùng có thể mở một sản phẩm từ danh mục trang chủ", () => {
    mockHomePage();

    cy.wait("@getProducts");

    cy.contains(".fashion-product-card a", "Radiance Glow Serum").click();
    cy.url().should("eq", `${Cypress.config("baseUrl")}/products/1`);
  });
});
