const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Phân tích tổng quan admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang tổng quan hiển thị đầy đủ KPI, biểu đồ và panel dữ liệu", () => {
    mockAdminWorkspace("/admin/overview");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains("h1", "Tổng Quan Kinh Doanh").should("be.visible");
    cy.contains(".overview-kpi-grid article", "Doanh thu").should("contain.text", "4.030.000");
    cy.contains(".overview-kpi-grid article", "Đơn hàng").should("contain.text", "2");
    cy.contains(".overview-kpi-grid article", "AOV").should("contain.text", "2.015.000");
    cy.contains(".overview-kpi-grid article", "Hoàn tất").should("contain.text", "0%");
    cy.get(".overview-bar-chart .overview-bar").should("have.length", 6);
    cy.contains(".overview-status-list article", "Chờ xử lý").should("contain.text", "1");
    cy.contains(".overview-status-list article", "Đang giao").should("contain.text", "1");
  });

  it("API1: Panel sản phẩm nổi bật lấy đúng sản phẩm có tồn kho cao nhất", () => {
    mockAdminWorkspace("/admin/overview");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".overview-product-list article", "Dolia Denim Relaxed")
      .should("contain.text", "24 còn");
    cy.contains(".overview-product-list article", "Dolia Blazer Modern")
      .should("contain.text", "8 còn");
  });

  it("VAL1: Khi không có sản phẩm, panel sản phẩm nổi bật hiển thị empty state rõ ràng", () => {
    mockAdminWorkspace("/admin/overview", {
      products: [],
    });

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".overview-product-list", "Chưa có sản phẩm").should("be.visible");
    cy.contains(".overview-product-list", "Thêm sản phẩm để bắt đầu thống kê.").should("be.visible");
  });

  it("NEG1: Overview vẫn hiển thị ổn định khi toàn bộ API thất bại", () => {
    mockAdminWorkspace("/admin/overview", {
      getAdminOrdersStatusCode: 500,
      getAdminOrdersBody: { message: "Cannot load orders" },
      getProductsStatusCode: 500,
      getProductsBody: { message: "Cannot load products" },
      getUsersStatusCode: 500,
      getUsersBody: { message: "Cannot load users" },
    });

    cy.contains("h1", "Tổng Quan Kinh Doanh").should("be.visible");
    cy.contains(".overview-kpi-grid article", "Doanh thu").should("contain.text", "0");
    cy.contains(".overview-kpi-grid article", "Đơn hàng").should("contain.text", "0");
    cy.contains(".overview-status-list article", "Chờ xử lý").should("contain.text", "0");
  });

  it("E2E1: Admin mở overview rồi vẫn giữ shell quản trị và có thể quay về dashboard", () => {
    mockAdminWorkspace("/admin/overview");

    cy.contains(".admin-sidebar a", "Dashboard").click();

    cy.url().should("eq", `${Cypress.config("baseUrl")}/admin`);
    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");
    cy.contains("h1", "Điều hành cửa hàng quần áo trong một màn hình.").should("be.visible");
  });
});
