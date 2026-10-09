describe("Dolia Shop - Phân hệ yêu thích", () => {
  const user = {
    id: 2,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    phone: "0123",
    address: "123 Beauty Street",
  };

  const favoriteProducts = [
    {
      id: 1,
      name: "Radiance Glow Serum",
      price: 29.99,
      description: "Vitamin C serum for brighter skin.",
      image: "https://images.example.com/serum.jpg",
      stock: 25,
      category: { id: 1, name: "Skincare" },
    },
    {
      id: 2,
      name: "Velvet Matte Lipstick",
      price: 19.5,
      description: "Long-lasting lipstick.",
      image: "https://images.example.com/lipstick.jpg",
      stock: 40,
      category: { id: 2, name: "Makeup" },
    },
  ];

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

  const mockFavoritesPage = ({
    asUser = false,
    favoriteIds = [1, 2],
    productIdsThatFail = [],
  } = {}) => {
    cy.mockCatalog();

    favoriteProducts.forEach((product) => {
      cy.intercept("GET", `**/api/products/${product.id}`, {
        statusCode: productIdsThatFail.includes(product.id) ? 500 : 200,
        body: productIdsThatFail.includes(product.id)
          ? { message: "Cannot load product" }
          : product,
      }).as(`getFavoriteProduct${product.id}`);
    });

    cy.intercept("POST", "**/api/cart/add", {
      statusCode: 200,
      body: cartAfterAdd,
    }).as("addToCart");

    cy.intercept("GET", "**/api/cart", {
      statusCode: 200,
      body: cart,
    }).as("getCart");

    cy.visit("/favorites", {
      onBeforeLoad(window) {
        if (asUser) {
          window.localStorage.setItem(`dolia_wishlist_user_${user.id}`, JSON.stringify(favoriteIds));
          window.localStorage.setItem("token", "mock-user-token");
          window.localStorage.setItem("user", JSON.stringify(user));
        } else {
          window.localStorage.setItem("dolia_wishlist_guest", JSON.stringify(favoriteIds));
        }
      },
    });

    if (asUser) {
      cy.wait("@getCart");
    }
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang yêu thích hiển thị thống kê và các thẻ sản phẩm yêu thích", () => {
    mockFavoritesPage();

    cy.wait("@getFavoriteProduct1");
    cy.wait("@getFavoriteProduct2");

    cy.contains(".fashion-category-stats article", "Đang hiển thị")
      .should("contain.text", "2");
    cy.contains(".fashion-category-stats article", "Tổng tồn kho")
      .should("contain.text", "65");
    cy.get(".fashion-product-card").should("have.length", 2);
    cy.contains("Radiance Glow Serum").should("exist");
    cy.contains("Velvet Matte Lipstick").should("exist");
  });

  it("DV2: Thẻ yêu thích hiển thị danh mục, giá, tồn kho và nút thêm vào giỏ", () => {
    mockFavoritesPage();

    cy.wait("@getFavoriteProduct1");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .should("contain.text", "Skincare")
      .and("contain.text", formatCurrency(29.99))
      .and("contain.text", "Còn 25 sản phẩm")
      .and("contain.text", "Thêm vào giỏ");
  });

  it("API1: Trang yêu thích tải sản phẩm từ các id wishlist đã lưu", () => {
    mockFavoritesPage({ favoriteIds: [1] });

    cy.wait("@getFavoriteProduct1");

    cy.get(".fashion-product-card").should("have.length", 1);
    cy.contains("Radiance Glow Serum").should("exist");
    cy.contains("Velvet Matte Lipstick").should("not.exist");
  });

  it("API2: Người dùng đã đăng nhập có thể thêm sản phẩm yêu thích vào giỏ", () => {
    mockFavoritesPage({ asUser: true });

    cy.wait("@getFavoriteProduct1");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .contains("button", "Thêm vào giỏ")
      .click();

    cy.wait("@addToCart").its("request.body").should("deep.equal", {
      product_id: 1,
      quantity: 1,
    });

    cy.contains(".toast", "Đã thêm vào giỏ hàng").should("exist");
  });

  it("API3: Xóa sản phẩm khỏi mục yêu thích sẽ cập nhật danh sách và hiển thị toast", () => {
    mockFavoritesPage();

    cy.wait("@getFavoriteProduct1");
    cy.wait("@getFavoriteProduct2");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .find(".fashion-wishlist-button")
      .click();

    cy.contains(".toast", "Đã bỏ khỏi yêu thích").should("exist");
    cy.get(".fashion-product-card").should("have.length", 1);
    cy.contains("Radiance Glow Serum").should("not.exist");
    cy.contains("Velvet Matte Lipstick").should("exist");
  });

  it("VAL1: Wishlist rỗng sẽ hiển thị thông báo trạng thái trống", () => {
    mockFavoritesPage({ favoriteIds: [] });

    cy.contains("h2", "Chưa có sản phẩm yêu thích.").should("be.visible");
    cy.contains("a", "Khám phá sản phẩm").should("be.visible");
    cy.get(".fashion-product-card").should("not.exist");
  });

  it("NEG1: Khách thêm vào giỏ sẽ bị chuyển hướng đến đăng nhập", () => {
    mockFavoritesPage();

    cy.wait("@getFavoriteProduct1");

    cy.contains(".fashion-product-card", "Radiance Glow Serum")
      .contains("button", "Thêm vào giỏ")
      .click();

    cy.contains(".toast", "Vui lòng đăng nhập để thêm sản phẩm").should("exist");
    cy.url().should("eq", loginUrl);
  });

  it("NEG2: Các yêu cầu sản phẩm lỗi sẽ bị bỏ qua trong khi các mục yêu thích hợp lệ vẫn được hiển thị", () => {
    mockFavoritesPage({ productIdsThatFail: [2] });

    cy.wait("@getFavoriteProduct1");
    cy.wait("@getFavoriteProduct2");

    cy.get(".fashion-product-card").should("have.length", 1);
    cy.contains("Radiance Glow Serum").should("exist");
    cy.contains("Velvet Matte Lipstick").should("not.exist");
  });

  it("NEG3: Người dùng vừa đăng nhập sẽ không kế thừa wishlist của khách", () => {
    cy.mockCatalog();

    favoriteProducts.forEach((product) => {
      cy.intercept("GET", `**/api/products/${product.id}`, {
        statusCode: 200,
        body: product,
      }).as(`getFavoriteProduct${product.id}`);
    });

    cy.intercept("GET", "**/api/cart", {
      statusCode: 200,
      body: cart,
    }).as("getCart");

    cy.visit("/favorites", {
      onBeforeLoad(window) {
        window.localStorage.setItem("dolia_wishlist_guest", JSON.stringify([1, 2]));
        window.localStorage.setItem("token", "mock-user-token");
        window.localStorage.setItem("user", JSON.stringify(user));
      },
    });

    cy.wait("@getCart");
    cy.contains("h2", "Chưa có sản phẩm yêu thích.").should("be.visible");
    cy.get(".fashion-product-card").should("not.exist");
  });

  it("E2E1: Người dùng có thể mở trang chi tiết sản phẩm từ mục yêu thích", () => {
    mockFavoritesPage();

    cy.wait("@getFavoriteProduct1");

    cy.contains(".fashion-product-card a", "Radiance Glow Serum").click();
    cy.url().should("eq", `${Cypress.config("baseUrl")}/products/1`);
  });
});
