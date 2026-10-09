const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Quản lý báo cáo admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang báo cáo hiển thị KPI, biểu đồ doanh thu và các nhóm thống kê", () => {
    mockAdminWorkspace("/admin/reports");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains("h1", "Báo cáo cửa hàng").should("be.visible");
    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận").should("contain.text", "4.030.000");
    cy.contains(".admin-report-kpis article", "Đã thanh toán").should("exist");
    cy.contains(".admin-report-kpis article", "Giá trị trung bình").should("contain.text", "2.015.000");
    cy.contains(".admin-report-kpis article", "Tỷ lệ thanh toán").should("contain.text", "0%");
    cy.get(".admin-report-bars .admin-report-bar").should("have.length", 12);
    cy.contains(".admin-report-panel", "Sản phẩm tạo doanh thu").should("exist");
    cy.contains(".admin-report-panel", "Cảnh báo tồn kho").should("exist");
  });

  it("API1: Bộ lọc theo tháng cập nhật số liệu về 0 khi chọn tháng không có đơn", () => {
    mockAdminWorkspace("/admin/reports");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.get(".admin-report-actions select").select("Theo tháng");
    cy.get('.admin-report-filter-card select').first().select("2026");
    cy.get('.admin-report-filter-card input[type="month"]').clear().type("2026-04");

    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận").should("contain.text", "0");
    cy.contains(".admin-report-kpis article", "Đã thanh toán").should("contain.text", "0");
  });

  it("API2: Bộ lọc theo ngày giữ lại đúng số liệu của ngày có đơn", () => {
    mockAdminWorkspace("/admin/reports");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.get(".admin-report-actions select").select("Theo ngày");
    cy.get('.admin-report-filter-card input[type="date"]').clear().type("2026-05-17");

    cy.contains(".admin-report-heading span", "1 đơn hàng trong phạm vi đã chọn").should("exist");
    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận").should("contain.text", "2.580.000");
  });

  it("VAL1: Chế độ tự chọn ngày render đầy đủ 2 trường từ ngày đến ngày", () => {
    mockAdminWorkspace("/admin/reports");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.get(".admin-report-actions select").select("Tự chọn ngày");
    cy.get('.admin-report-filter-card input[type="date"]').should("have.length", 2);
  });

  it("NEG1: Báo cáo rơi về trạng thái rỗng an toàn khi API lỗi", () => {
    mockAdminWorkspace("/admin/reports", {
      getAdminOrdersStatusCode: 500,
      getAdminOrdersBody: { message: "Cannot load orders" },
      getProductsStatusCode: 500,
      getProductsBody: { message: "Cannot load products" },
      getUsersStatusCode: 500,
      getUsersBody: { message: "Cannot load users" },
    });

    cy.contains("h1", "Báo cáo cửa hàng").should("be.visible");
    cy.contains(".admin-report-kpis article", "Doanh thu ghi nhận").should("contain.text", "0");
    cy.contains(".admin-report-panel", "Sản phẩm tạo doanh thu")
      .should("contain.text", "Chưa có sản phẩm phát sinh doanh thu trong kỳ này.");
    cy.contains(".admin-report-panel", "Cảnh báo tồn kho")
      .should("contain.text", "Tồn kho đang ổn định.");
  });

  it("E2E1: Admin chuyển từ báo cáo sang overview qua sidebar mà không mất shell quản trị", () => {
    mockAdminWorkspace("/admin/reports");

    cy.contains(".admin-sidebar a", "Tổng Quan").click();

    cy.url().should("include", "/admin/overview");
    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");
    cy.contains("h1", "Tổng Quan Kinh Doanh").should("be.visible");
  });
});
