const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Quản lý voucher admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang voucher hiển thị thống kê và bảng voucher", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");

    cy.contains("h1", "Quản Lý Voucher").should("be.visible");
    cy.contains(".voucher-admin-stats", "Tổng voucher").should("contain.text", "3");
    cy.contains(".voucher-admin-stats", "Đang chạy").should("exist");
    cy.contains(".product-admin-table tbody tr", "SAVE10").should("exist");
    cy.contains(".product-admin-table tbody tr", "SHIPFREE").should("exist");
  });

  it("DV2: Tìm kiếm theo mã hoặc tên voucher thu hẹp đúng bảng dữ liệu", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");

    cy.get('.product-admin-toolbar input[type="search"]').type("ship");
    cy.contains(".product-admin-table tbody tr", "SHIPFREE").should("exist");
    cy.contains(".product-admin-table tbody tr", "SAVE10").should("not.exist");
  });

  it("API1: Admin có thể tạo voucher mới", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");

    cy.contains("button", "Thêm Voucher").click();
    cy.get('input[placeholder="VD: SUMMER20"]').type("summer20");
    cy.get('input[placeholder="Giảm mùa hè"]').type("Giảm mùa hè");
    cy.get('input[type="number"]').eq(0).clear().type("20");
    cy.get('input[type="number"]').eq(1).clear().type("400000");
    cy.get('input[type="number"]').eq(2).clear().type("120000");
    cy.get('input[type="number"]').eq(3).clear().type("80");
    cy.get('input[type="date"]').eq(0).type("2026-06-01");
    cy.get('input[type="date"]').eq(1).type("2026-07-15");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Tạo Voucher").click();

    cy.wait("@createVoucher").its("request.body").should("deep.include", {
      code: "SUMMER20",
      name: "Giảm mùa hè",
      type: "percent",
    });
    cy.contains(".toast", "Đã tạo voucher").should("exist");
    cy.contains(".product-admin-table tbody tr", "SUMMER20").should("exist");
  });

  it("API2: Lọc voucher theo trạng thái chỉ hiển thị các bản ghi phù hợp", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");

    cy.get(".product-admin-toolbar select").select("Đã tắt");
    cy.contains(".product-admin-table tbody tr", "VIP20").should("exist");
    cy.contains(".product-admin-table tbody tr", "SAVE10").should("not.exist");
  });

  it("VAL1: Form voucher chặn submit khi thiếu mã voucher", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");

    cy.contains("button", "Thêm Voucher").click();
    cy.get('input[placeholder="Giảm mùa hè"]').type("Giảm mùa hè");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Tạo Voucher").click();

    cy.get('input[placeholder="VD: SUMMER20"]').then(([input]) => {
      expect(input.checkValidity()).to.equal(false);
      expect(input.validationMessage).not.to.equal("");
    });
  });

  it("VAL2: Voucher miễn phí vận chuyển không bắt buộc nhập giá trị giảm", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");

    cy.contains("button", "Thêm Voucher").click();
    cy.get('input[placeholder="VD: SUMMER20"]').type("shipx");
    cy.get('input[placeholder="Giảm mùa hè"]').type("Miễn ship nhanh");
    cy.get("select").last().select("Miễn phí vận chuyển");
    cy.get('input[type="date"]').eq(0).type("2026-06-01");
    cy.get('input[type="date"]').eq(1).type("2026-06-30");

    cy.get('input[type="number"]').first().then(([input]) => {
      expect(input.required).to.equal(false);
    });

    cy.contains('.product-admin-form-actions button[type="submit"]', "Tạo Voucher").click();
    cy.wait("@createVoucher").its("request.body.type").should("eq", "free_shipping");
  });

  it("NEG1: Xóa voucher thất bại hiển thị lỗi backend", () => {
    mockAdminWorkspace("/admin/vouchers", {
      deleteVoucherStatusCode: 500,
      deleteVoucherErrorBody: { message: "Delete failed" },
    });

    cy.wait("@getAdminVouchers");

    cy.contains(".product-admin-table tbody tr", "SAVE10")
      .find('button[title="Xóa"]')
      .click();

    cy.wait("@deleteVoucher");
    cy.contains(".toast", "Delete failed").should("exist");
    cy.contains(".product-admin-table tbody tr", "SAVE10").should("exist");
  });

  it("NEG2: Tạo voucher thất bại giữ nguyên form và hiển thị lỗi backend", () => {
    mockAdminWorkspace("/admin/vouchers", {
      createVoucherStatusCode: 500,
      createVoucherErrorBody: { message: "Create voucher failed" },
    });

    cy.wait("@getAdminVouchers");

    cy.contains("button", "Thêm Voucher").click();
    cy.get('input[placeholder="VD: SUMMER20"]').type("fall30");
    cy.get('input[placeholder="Giảm mùa hè"]').type("Giảm cuối mùa");
    cy.get('input[type="number"]').eq(0).clear().type("30");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Tạo Voucher").click();

    cy.wait("@createVoucher");
    cy.contains(".toast", "Create voucher failed").should("exist");
    cy.contains(".product-admin-drawer h2", "Thêm Voucher").should("be.visible");
    cy.get('input[placeholder="VD: SUMMER20"]').should("have.value", "FALL30");
  });

  it("E2E1: Admin có thể sửa rồi lọc lại voucher theo trạng thái", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");

    cy.contains(".product-admin-table tbody tr", "SAVE10")
      .find('button[title="Sửa"]')
      .click();

    cy.get('input[placeholder="Giảm mùa hè"]').clear().type("Voucher đã cập nhật");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Cập Nhật").click();

    cy.wait("@updateVoucher");
    cy.contains(".toast", "Đã cập nhật voucher").should("exist");
    cy.contains(".product-admin-table tbody tr", "Voucher đã cập nhật").should("exist");

    cy.get('.product-admin-toolbar select').select("Đang chạy");
    cy.contains(".product-admin-table tbody tr", "SAVE10").should("exist");
  });

  it("E2E2: Admin có thể xóa voucher thành công và số liệu tổng voucher giảm theo", () => {
    mockAdminWorkspace("/admin/vouchers");

    cy.wait("@getAdminVouchers");
    cy.contains(".voucher-admin-stats", "Tổng voucher").should("contain.text", "3");

    cy.contains(".product-admin-table tbody tr", "SHIPFREE")
      .find('button[title="Xóa"]')
      .click();

    cy.wait("@deleteVoucher");
    cy.contains(".toast", "Đã xóa voucher").should("exist");
    cy.contains(".product-admin-table tbody tr", "SHIPFREE").should("not.exist");
    cy.contains(".voucher-admin-stats", "Tổng voucher").should("contain.text", "2");
  });
});
