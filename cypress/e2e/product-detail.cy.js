describe("Dolia Shop - Phân hệ chi tiết sản phẩm", () => {
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

  const cartAfterAdd = {
    id: 1,
    user_id: 2,
    items: [
      {
        id: 1,
        product_id: 1,
        quantity: 3,
        product: {
          id: 1,
          name: "Radiance Glow Serum",
          price: 29.99,
          image: "https://images.example.com/serum.jpg",
        },
      },
    ],
    totalPrice: 89.97,
  };

  const loginUrl = `${Cypress.config("baseUrl")}/login`;
  const checkoutUrl = `${Cypress.config("baseUrl")}/checkout`;
  const reviewImageUpload = {
    contents: Cypress.Buffer.from("fake-review-image"),
    fileName: "review.png",
    mimeType: "image/png",
    lastModified: Date.now(),
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const mockProductDetailPage = ({ authUser = null } = {}) => {
    cy.mockCatalog();

    if (authUser?.id) {
      cy.intercept("GET", `**/api/users/${authUser.id}`, {
        statusCode: 200,
        body: authUser,
      }).as("getCurrentUser");
    }

    cy.intercept("POST", "**/api/cart/add", {
      statusCode: 200,
      body: cartAfterAdd,
    }).as("addToCart");

    cy.intercept("GET", "**/api/cart", {
      statusCode: 200,
      body: cart,
    }).as("getCart");

    cy.visit("/products/1", {
      onBeforeLoad(window) {
        window.localStorage.clear();
        if (authUser) {
          window.localStorage.setItem("token", "mock-user-token");
          window.localStorage.setItem("user", JSON.stringify(authUser));
        }
      },
    });

    if (authUser?.role === "user") {
      cy.wait("@getCurrentUser");
      cy.wait("@getCart");
    }
    if (authUser?.role === "admin") {
      cy.wait("@getCurrentUser");
    }
    cy.wait("@getProduct");
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang chi tiết sản phẩm hiển thị breadcrumb, ảnh, tên, giá và đánh giá", () => {
    mockProductDetailPage();

    cy.contains("a", "Trang chủ").should("exist");
    cy.contains("strong", "Radiance Glow Serum").should("exist");
    cy.contains("h1", "Radiance Glow Serum").should("be.visible");
    cy.contains(".fashion-detail-price", formatCurrency(29.99)).should("exist");
    cy.contains("h2", "Mô tả chi tiết").should("exist");
    cy.contains("h2", "Đánh giá và bình luận").should("exist");
    cy.get('.fashion-detail-main-image img[alt="Radiance Glow Serum"]').should("exist");
  });

  it("DV2: Trang chi tiết sản phẩm hiển thị màu sắc, kích cỡ, số lượng và các nút thao tác", () => {
    mockProductDetailPage();

    cy.contains("strong", "Màu sắc").should("exist");
    cy.contains("strong", "Kích thước").should("exist");
    cy.contains("span", "Đang chọn size M").should("exist");
    cy.get('.fashion-detail-actions input[type="number"]').should("have.value", "1");
    cy.contains(".fashion-detail-actions button", "Thêm vào giỏ").should("exist");
    cy.contains(".fashion-detail-actions button", "Mua ngay").should("exist");
  });

  it("DV3: Mô tả sản phẩm và ghi chú tồn kho được hiển thị", () => {
    mockProductDetailPage();

    cy.contains(".fashion-detail-description", "Vitamin C serum for brighter skin.").should("be.visible");
    cy.contains(".fashion-detail-notes span", "Còn 25 sản phẩm trong kho").should("exist");
    cy.contains(".fashion-detail-notes span", "Đổi trả trong 7 ngày").should("exist");
  });

  it("API1: Người dùng có thể đổi kích cỡ, màu sắc và số lượng trước khi thêm vào giỏ", () => {
    mockProductDetailPage({ authUser: user });

    cy.contains(".fashion-size-list button", "XL").click();
    cy.get('.fashion-color-list button[aria-label="Đỏ rượu"]').click();
    cy.get('.fashion-detail-actions input[type="number"]').focus().type("{selectall}3");
    cy.contains(".fashion-detail-actions button", "Thêm vào giỏ").click();

    cy.wait("@addToCart").its("request.body").should("deep.equal", {
      product_id: 1,
      quantity: 3,
    });

    cy.contains(".toast", "Đã thêm size XL, màu Đỏ rượu vào giỏ hàng").should("exist");
  });

  it("API1B: Ảnh sản phẩm được hiển thị và có thuộc tính src hợp lệ", () => {
    mockProductDetailPage();

    cy.get('.fashion-detail-main-image img[alt="Radiance Glow Serum"]')
      .should("be.visible")
      .and("have.attr", "src")
      .and("include", "serum.jpg");
  });

  it("API2: Mua ngay sẽ lưu id sản phẩm đã chọn và chuyển hướng đến checkout", () => {
    mockProductDetailPage({ authUser: user });

    cy.contains(".fashion-size-list button", "L").click();
    cy.get('.fashion-detail-actions input[type="number"]').focus().type("{selectall}2");
    cy.contains(".fashion-detail-actions button", "Mua ngay").click();

    cy.wait("@addToCart").its("request.body").should("deep.equal", {
      product_id: 1,
      quantity: 2,
    });

    cy.url().should("eq", checkoutUrl);
    cy.window().then((window) => {
      expect(JSON.parse(window.sessionStorage.getItem("dolia_checkout_product_ids"))).to.deep.equal([1]);
    });
  });

  it("API3: Người dùng có thể bật tắt trạng thái yêu thích từ trang chi tiết", () => {
    mockProductDetailPage();

    cy.contains(".detail-wishlist-button", "Yêu thích").click();
    cy.contains(".toast", "Đã thêm vào yêu thích").should("exist");
    cy.contains(".detail-wishlist-button", "Đã yêu thích").should("exist");
  });

  it("API4: Người dùng có thể gửi đánh giá dạng văn bản cho sản phẩm", () => {
    mockProductDetailPage({ authUser: user });

    cy.get('.fashion-review-form textarea').type("Sản phẩm dùng rất ổn và thấm nhanh.");
    cy.contains('.fashion-review-form button[type="submit"]', "Gửi đánh giá").click();

    cy.contains(".toast", "Đã gửi đánh giá").should("exist");
    cy.contains(".fashion-review-list article", "Sản phẩm dùng rất ổn và thấm nhanh.").should("exist");
    cy.contains(".fashion-review-list article strong", "Alice").should("exist");
  });

  it("API4B: Người dùng có thể đính kèm ảnh đánh giá và xem trước trước khi gửi", () => {
    mockProductDetailPage({ authUser: user });

    cy.get('.fashion-review-upload input[type="file"]').selectFile(reviewImageUpload, { force: true });

    cy.get(".fashion-review-preview img")
      .should("be.visible")
      .invoke("attr", "src")
      .should("match", /^data:image/);
  });

  it("API4C: Đánh giá đã gửi kèm ảnh được hiển thị trong danh sách đánh giá", () => {
    mockProductDetailPage({ authUser: user });

    cy.get('.fashion-review-upload input[type="file"]').selectFile(reviewImageUpload, { force: true });
    cy.get('.fashion-review-form textarea').type("Mình có đính kèm ảnh feedback cho sản phẩm này.");
    cy.contains('.fashion-review-form button[type="submit"]', "Gửi đánh giá").click();

    cy.contains(".toast", "Đã gửi đánh giá").should("exist");
    cy.contains(".fashion-review-list article", "Mình có đính kèm ảnh feedback cho sản phẩm này.").should("exist");
    cy.get(".fashion-review-list .fashion-review-photo").should("exist");
  });

  it("API4D: Đánh giá của khách sẽ dùng tên khách hàng mặc định", () => {
    mockProductDetailPage();

    cy.get('.fashion-review-form textarea').type("Mình là khách ghé xem và để lại đánh giá.");
    cy.contains('.fashion-review-form button[type="submit"]', "Gửi đánh giá").click();

    cy.contains(".toast", "Đã gửi đánh giá").should("exist");
    cy.contains(".fashion-review-list article strong", "Khách hàng").should("exist");
  });

  it("API4E: Đánh giá vẫn được lưu trong localStorage sau khi tải lại trang", () => {
    mockProductDetailPage({ authUser: user });

    cy.get('.fashion-review-form textarea').type("Đánh giá này cần còn lại sau khi tải lại trang.");
    cy.contains('.fashion-review-form button[type="submit"]', "Gửi đánh giá").click();
    cy.contains(".toast", "Đã gửi đánh giá").should("exist");

    cy.reload();
    cy.wait("@getCurrentUser");
    cy.wait("@getCart");
    cy.wait("@getProduct");

    cy.contains(".fashion-review-list article", "Đánh giá này cần còn lại sau khi tải lại trang.").should("exist");
  });

  it("VAL1: Ô nhập số lượng được chuẩn hóa trong khoảng từ 1 đến số lượng tồn kho", () => {
    mockProductDetailPage();

    cy.get('.fashion-detail-actions input[type="number"]').focus().type("{selectall}0");
    cy.get('.fashion-detail-actions input[type="number"]').should("have.value", "1");

    cy.get('.fashion-detail-actions input[type="number"]').focus().type("{selectall}999");
    cy.get('.fashion-detail-actions input[type="number"]').should("have.value", "25");
  });

  it("VAL2: Gửi đánh giá rỗng sẽ bị chặn và hiển thị toast lỗi", () => {
    mockProductDetailPage({ authUser: user });

    cy.contains('.fashion-review-form button[type="submit"]', "Gửi đánh giá").click();

    cy.contains(".toast", "Vui lòng nhập bình luận").should("exist");
  });

  it("VAL3B: Tải lên tệp đánh giá không phải ảnh sẽ bị từ chối", () => {
    mockProductDetailPage({ authUser: user });

    cy.get('.fashion-review-upload input[type="file"]').selectFile({
      contents: Cypress.Buffer.from("plain-text-file"),
      fileName: "notes.txt",
      mimeType: "text/plain",
      lastModified: Date.now() + 1,
    }, { force: true });

    cy.contains(".toast", "Vui lòng chọn file ảnh").should("exist");
    cy.get(".fashion-review-preview").should("not.exist");
  });

  it("VAL3C: Có thể xóa phần xem trước ảnh đánh giá trước khi gửi", () => {
    mockProductDetailPage({ authUser: user });

    cy.get('.fashion-review-upload input[type="file"]').selectFile(reviewImageUpload, { force: true });
    cy.get(".fashion-review-preview").should("exist");
    cy.contains(".fashion-review-preview button", "Xóa ảnh").click();
    cy.get(".fashion-review-preview").should("not.exist");
  });

  it("VAL3D: Danh sách đánh giá có thể mở rộng và thu gọn khi có hơn ba đánh giá", () => {
    mockProductDetailPage({ authUser: user });

    cy.get('.fashion-review-form textarea').type("Review thu 4 để mở rộng danh sách.");
    cy.contains('.fashion-review-form button[type="submit"]', "Gửi đánh giá").click();
    cy.contains(".toast", "Đã gửi đánh giá").should("exist");

    cy.contains(".fashion-review-more", "Show more").click();
    cy.get(".fashion-review-list article").should("have.length.greaterThan", 3);
    cy.contains(".fashion-review-more", "Thu gọn").click();
    cy.get(".fashion-review-list article").should("have.length", 3);
  });

  it("VAL3: Nút thêm vào giỏ và mua ngay vẫn được bật khi sản phẩm còn hàng", () => {
    mockProductDetailPage();

    cy.contains(".fashion-detail-actions button", "Thêm vào giỏ").should("be.enabled");
    cy.contains(".fashion-detail-actions button", "Mua ngay").should("be.enabled");
  });

  it("NEG1: Khách thêm vào giỏ sẽ bị chuyển hướng đến đăng nhập", () => {
    mockProductDetailPage();

    cy.contains(".fashion-detail-actions button", "Thêm vào giỏ").click();

    cy.contains(".toast", "Vui lòng đăng nhập để thêm sản phẩm").should("exist");
    cy.url().should("eq", loginUrl);
  });

  it("NEG2: Tài khoản admin không thể thêm sản phẩm vào giỏ hoặc mua ngay", () => {
    mockProductDetailPage({ authUser: admin });

    cy.contains(".fashion-detail-actions button", "Thêm vào giỏ").click();
    cy.contains(".toast", "Tài khoản admin không thể thêm vào giỏ hàng").should("exist");

    cy.contains(".fashion-detail-actions button", "Mua ngay").click();
    cy.contains(".toast", "Tài khoản admin không thể mua hàng").should("exist");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/products/1`);
  });

  it("E2E1: Người dùng có thể mở trang chi tiết, tùy chỉnh sản phẩm và mua ngay", () => {
    mockProductDetailPage({ authUser: user });

    cy.contains(".fashion-size-list button", "S").click();
    cy.get('.fashion-color-list button[aria-label="Kem sáng"]').click();
    cy.get('.fashion-detail-actions input[type="number"]').focus().type("{selectall}2");
    cy.contains(".fashion-detail-actions button", "Mua ngay").click();

    cy.contains(".toast", "Đã chọn size S, màu Kem sáng").should("exist");
    cy.url().should("eq", checkoutUrl);
  });

  it("E2E2: Breadcrumb cho phép người dùng quay lại trang chủ", () => {
    mockProductDetailPage();

    cy.contains(".fashion-detail-breadcrumb a", "Trang chủ").click();

    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
  });
});
