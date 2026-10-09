const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Quản lý đơn hàng admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang quản lý đơn hàng hiển thị bảng, trạng thái và chi tiết đơn", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains("h1", "Bảng Điều Khiển & Quản Lý").should("be.visible");
    cy.contains(".dashboard-table tbody tr", "DH010").should("contain.text", "Alice Nguyen");
    cy.contains(".dashboard-table tbody tr", "DH011").should("contain.text", "Minh Tran");

    cy.contains(".dashboard-table tbody tr", "DH010")
      .contains("button", "Xem")
      .click();

    cy.contains('[role="dialog"] h2', "DH010").should("be.visible");
    cy.contains(".order-admin-summary", "Khách hàng").should("contain.text", "Alice Nguyen");
    cy.contains(".order-admin-address", "Người nhận: Alice Nguyen").should("exist");
  });

  it("DV2: Bảng đơn hàng hiển thị đúng trạng thái thanh toán và sản phẩm trong đơn", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".dashboard-table tbody tr", "DH010")
      .should("contain.text", "Chờ thanh toán")
      .and("contain.text", "Dolia Blazer Modern, Dolia Denim Relaxed");

    cy.contains(".dashboard-table tbody tr", "DH011")
      .should("contain.text", "Chưa thanh toán")
      .and("contain.text", "Dolia Street Sneaker");
  });

  it("API1: Admin có thể cập nhật nhanh trạng thái đơn hàng và xác nhận thanh toán", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".dashboard-table tbody tr", "DH010")
      .find('select[aria-label="Cập nhật tình trạng đơn hàng"]')
      .select("Đã xác nhận");

    cy.wait("@updateOrderStatus").its("request.body").should("deep.equal", {
      status: "confirmed",
    });
    cy.contains(".toast", "Đã lưu tình trạng đơn hàng").should("exist");
    cy.contains(".dashboard-table tbody tr", "DH010")
      .find('select[aria-label="Cập nhật tình trạng đơn hàng"]')
      .should("have.value", "confirmed");

    cy.contains(".dashboard-table tbody tr", "DH010")
      .contains("button", "Đã nhận tiền")
      .click();

    cy.wait("@confirmOrderPayment");
    cy.contains(".toast", "Đã xác nhận thanh toán").should("exist");
    cy.contains(".dashboard-table tbody tr", "DH010").should("contain.text", "Đã thanh toán");
  });

  it("API2: Tìm kiếm đơn hàng theo tên khách thu hẹp kết quả trong bảng", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.get('.product-admin-search input[type="search"]').type("Minh Tran");

    cy.contains(".dashboard-table tbody tr", "DH011").should("exist");
    cy.contains(".dashboard-table tbody tr", "DH010").should("not.exist");
  });

  it("VAL1: Bộ lọc tìm kiếm đơn hàng tự trim khoảng trắng và không phân biệt hoa thường", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.get('.product-admin-search input[type="search"]').type("  dh010  ");

    cy.contains(".dashboard-table tbody tr", "DH010").should("exist");
    cy.contains(".dashboard-table tbody tr", "DH011").should("not.exist");
  });

  it("VAL2: Mở drawer sửa đơn rồi bấm hủy sẽ quay lại chế độ xem", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".dashboard-table tbody tr", "DH011")
      .contains("button", "Sửa")
      .click();

    cy.contains('.order-admin-form-actions button[type="button"]', "Hủy").click();
    cy.get(".order-admin-form").should("not.exist");
    cy.contains(".order-admin-address", "Người nhận: Minh Tran").should("exist");
  });

  it("NEG1: Khi API đơn hàng lỗi, trang vẫn hiển thị fallback row thay vì vỡ layout", () => {
    mockAdminWorkspace("/admin/orders", {
      getAdminOrdersStatusCode: 500,
      getAdminOrdersBody: { message: "Cannot load orders" },
      getProductsStatusCode: 500,
      getProductsBody: { message: "Cannot load products" },
      getUsersStatusCode: 500,
      getUsersBody: { message: "Cannot load users" },
    });

    cy.contains(".dashboard-table tbody tr", "DH095").should("exist");
    cy.contains(".dashboard-table tbody tr", "Lê Thị Bình").should("exist");
  });

  it("NEG2: Xác nhận thanh toán thất bại hiển thị lỗi và giữ nguyên trạng thái cũ", () => {
    mockAdminWorkspace("/admin/orders", {
      confirmOrderPaymentStatusCode: 500,
      confirmOrderPaymentErrorBody: { message: "Payment confirm failed" },
    });

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".dashboard-table tbody tr", "DH010")
      .contains("button", "Đã nhận tiền")
      .click();

    cy.wait("@confirmOrderPayment");
    cy.contains(".toast", "Payment confirm failed").should("exist");
    cy.contains(".dashboard-table tbody tr", "DH010").should("contain.text", "Chờ thanh toán");
  });

  it("E2E1: Admin có thể xem chi tiết và sửa đơn hàng trong drawer", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".dashboard-table tbody tr", "DH011")
      .contains("button", "Sửa")
      .click();

    cy.contains('[role="dialog"] h2', "DH011").should("be.visible");
    cy.get('.order-admin-form select').select("Đã giao");
    cy.contains('.order-admin-form-actions button[type="submit"]', "Lưu thay đổi").click();

    cy.wait("@updateOrder").its("request.body").should("deep.equal", {
      status: "delivered",
    });
    cy.contains(".toast", "Đã cập nhật đơn hàng").should("exist");
    cy.contains(".dashboard-table tbody tr", "DH011")
      .find('select[aria-label="Cập nhật tình trạng đơn hàng"]')
      .should("have.value", "delivered");
  });

  it("E2E2: Admin mở chi tiết đơn rồi đóng drawer để tiếp tục thao tác trong bảng", () => {
    mockAdminWorkspace("/admin/orders");

    cy.wait("@getAdminOrders");
    cy.wait("@getProducts");
    cy.wait("@getUsers");

    cy.contains(".dashboard-table tbody tr", "DH010")
      .contains("button", "Xem")
      .click();

    cy.contains('[role="dialog"] h2', "DH010").should("be.visible");
    cy.contains(".order-admin-form-actions button", "Đóng").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains(".dashboard-table tbody tr", "DH011").should("exist");
  });
});
