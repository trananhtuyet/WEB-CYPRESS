const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Luồng dashboard admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Dashboard hiển thị số liệu tổng quan và lối tắt quản trị", () => {
    mockAdminWorkspace("/admin");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains("h1", "Điều hành cửa hàng quần áo trong một màn hình.").should("be.visible");
    cy.contains(".admin-home-action-card", "Quản Lý Đơn Hàng").should("exist");
    cy.contains(".admin-home-action-card", "Quản Lý Sản Phẩm").should("exist");
    cy.contains(".admin-home-action-card", "Quản Lý Khách Hàng").should("exist");
    cy.contains(".admin-home-revenue-card", "Doanh thu hiện tại")
      .should("contain.text", "4.030.000");
    cy.contains(".admin-home-panel", "Đơn hàng gần đây").should("contain.text", "DH010");
    cy.contains(".admin-home-panel", "Cảnh báo tồn kho").should("contain.text", "Dolia Street Sneaker");
  });

  it("DV2: Dashboard hiển thị đúng nội dung card đơn gần đây và tồn kho cảnh báo", () => {
    mockAdminWorkspace("/admin");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".admin-home-list-row", "DH010")
      .should("contain.text", "Alice Nguyen")
      .and("contain.text", "2.580.000")
      .and("contain.text", "Đang xử lý");

    cy.contains(".admin-home-stock-row", "Dolia Street Sneaker")
      .should("contain.text", "4 sản phẩm còn lại");
    cy.contains(".admin-home-stock-row", "Dolia Blazer Modern")
      .should("contain.text", "8 sản phẩm còn lại");
  });

  it("NAV1: Tìm kiếm ở topbar admin điều hướng đúng sang trang đơn hàng", () => {
    mockAdminWorkspace("/admin");

    cy.get('.admin-search input[type="search"]').type("DH010{enter}");

    cy.url().should("include", "/admin/orders?search=DH010");
    cy.wait("@getAdminOrders");
    cy.contains(".dashboard-table tbody tr", "DH010").should("exist");
    cy.contains(".dashboard-table tbody tr", "DH011").should("not.exist");
  });

  it("API1: Quick action card mở đúng trang quản lý sản phẩm", () => {
    mockAdminWorkspace("/admin");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".admin-home-action-card", "Quản Lý Sản Phẩm").click();

    cy.url().should("include", "/admin/products");
    cy.wait("@getCategories");
    cy.wait("@getProducts");
    cy.contains("h1", "Quản Lý Sản Phẩm").should("be.visible");
  });

  it("API2: Tìm kiếm admin bằng email điều hướng đúng sang trang khách hàng", () => {
    mockAdminWorkspace("/admin");

    cy.get('.admin-search input[type="search"]').type("alice@example.com{enter}");

    cy.url().should("include", "/admin/users?search=alice%40example.com");
    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("exist");
    cy.contains(".customer-table tbody tr", "Minh Tran").should("not.exist");
  });

  it("VAL1: Tìm kiếm admin với nội dung chỉ có khoảng trắng giữ người dùng ở dashboard", () => {
    mockAdminWorkspace("/admin");

    cy.get('.admin-search input[type="search"]').type("   {enter}");

    cy.url().should("eq", `${Cypress.config("baseUrl")}/admin`);
    cy.contains("h1", "Điều hành cửa hàng quần áo trong một màn hình.").should("be.visible");
  });

  it("VAL2: Tìm kiếm admin với từ khóa sản phẩm điều hướng đúng sang quản lý sản phẩm", () => {
    mockAdminWorkspace("/admin");

    cy.get('.admin-search input[type="search"]').type("blazer{enter}");

    cy.url().should("include", "/admin/products?search=blazer");
    cy.wait("@getCategories");
    cy.wait("@getProducts");
    cy.get('.product-admin-toolbar input[type="search"]').should("have.value", "blazer");
  });

  it("NEG1: Dashboard vẫn hiển thị an toàn khi các API chính tải thất bại", () => {
    mockAdminWorkspace("/admin", {
      getAdminOrdersStatusCode: 500,
      getAdminOrdersBody: { message: "Cannot load orders" },
      getProductsStatusCode: 500,
      getProductsBody: { message: "Cannot load products" },
      getUsersStatusCode: 500,
      getUsersBody: { message: "Cannot load users" },
    });

    cy.contains(".admin-home-revenue-card", "Doanh thu hiện tại")
      .should("contain.text", "0");
    cy.contains(".admin-home-panel", "Đơn hàng gần đây").should("contain.text", "Chưa có đơn hàng");
    cy.contains(".admin-home-panel", "Cảnh báo tồn kho").should("contain.text", "Tồn kho ổn định");
  });

  it("NEG2: Dashboard vẫn render shell admin khi chỉ API users lỗi", () => {
    mockAdminWorkspace("/admin", {
      getUsersStatusCode: 500,
      getUsersBody: { message: "Cannot load users" },
    });

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".admin-sidebar", "Dashboard").should("be.visible");
    cy.contains(".admin-home-action-card", "Quản Lý Khách Hàng")
      .should("contain.text", "0 khách hàng đang hoạt động");
  });

  it("E2E1: Dashboard điều hướng sang quản lý khách hàng và giữ nguyên shell admin", () => {
    mockAdminWorkspace("/admin");

    cy.contains(".admin-home-action-card", "Quản Lý Khách Hàng").click();

    cy.url().should("include", "/admin/users");
    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");
    cy.contains(".admin-sidebar", "Quản Lý Khách Hàng").should("be.visible");
    cy.contains("h1", "Bảng Điều Khiển Khách Hàng").should("be.visible");
  });

  it("E2E2: Dashboard cho phép đi từ quick action sang đơn hàng rồi mở chi tiết đơn", () => {
    mockAdminWorkspace("/admin");

    cy.contains(".admin-home-action-card", "Quản Lý Đơn Hàng").click();

    cy.url().should("include", "/admin/orders");
    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".dashboard-table tbody tr", "DH010")
      .contains("button", "Xem")
      .click();

    cy.contains('[role="dialog"] h2', "DH010").should("be.visible");
    cy.contains(".order-admin-products-body", "Dolia Blazer Modern").should("exist");
    cy.contains(".order-admin-products-body", "Dolia Denim Relaxed").should("exist");
  });
});
