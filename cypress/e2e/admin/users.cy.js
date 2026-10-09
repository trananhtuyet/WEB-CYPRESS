const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Quản lý người dùng admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang quản lý khách hàng hiển thị thống kê, bảng dữ liệu và biểu đồ", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.contains("h1", "Bảng Điều Khiển Khách Hàng").should("be.visible");
    cy.contains(".customer-stat-card", "Tổng khách hàng").should("contain.text", "2");
    cy.contains(".customer-stat-card", "Khách hàng mới (tháng)").should("exist");
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("exist");
    cy.contains(".customer-loyal-table", "Alice Nguyen").should("exist");
    cy.contains(".customer-age-chart", "20-30").should("exist");
  });

  it("DV2: Bảng khách hàng hiển thị đúng mã KH, tổng chi tiêu và tình trạng", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.contains(".customer-table tbody tr", "Alice Nguyen")
      .should("contain.text", "KH002")
      .and("contain.text", "2.580.000")
      .and("contain.text", "Hoạt Động");

    cy.contains(".customer-table tbody tr", "Minh Tran")
      .should("contain.text", "KH003")
      .and("contain.text", "1.450.000")
      .and("contain.text", "Hoạt Động");
  });

  it("API1: Admin có thể tìm kiếm khách hàng theo email", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.get('.product-admin-search input[type="search"]').type("alice@example.com");
    cy.url().should("include", "/admin/users?search=alice%40example.com");
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("exist");
    cy.contains(".customer-table tbody tr", "Minh Tran").should("not.exist");
    cy.contains(".customer-stat-card", "Tổng khách hàng").should("contain.text", "2");
  });

  it("API2: Admin có thể tìm kiếm khách hàng theo số điện thoại", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.get('.product-admin-search input[type="search"]').type("0900000002");
    cy.contains(".customer-table tbody tr", "Minh Tran").should("exist");
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("not.exist");
  });

  it("VAL1: Tìm kiếm khách hàng chấp nhận mã KH có khoảng trắng và khác biệt hoa thường", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.get('.product-admin-search input[type="search"]').type("  kh002  ");
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("exist");
    cy.contains(".customer-table tbody tr", "Minh Tran").should("not.exist");
  });

  it("VAL2: Tìm kiếm rỗng hiển thị lại đầy đủ danh sách khách hàng", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.get('.product-admin-search input[type="search"]').type("alice@example.com");
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("exist");
    cy.contains(".customer-table tbody tr", "Minh Tran").should("not.exist");

    cy.get('.product-admin-search input[type="search"]').clear();
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("exist");
    cy.contains(".customer-table tbody tr", "Minh Tran").should("exist");
  });

  it("NEG1: Khi tải dữ liệu khách hàng thất bại, trang vẫn render an toàn với số liệu rỗng", () => {
    mockAdminWorkspace("/admin/users", {
      getUsersStatusCode: 500,
      getUsersBody: { message: "Cannot load users" },
      getAdminOrdersStatusCode: 500,
      getAdminOrdersBody: { message: "Cannot load orders" },
    });

    cy.contains("h1", "Bảng Điều Khiển Khách Hàng").should("be.visible");
    cy.contains(".customer-stat-card", "Tổng khách hàng").should("contain.text", "0");
    cy.get(".customer-table tbody tr").should("have.length", 0);
  });

  it("NEG2: Khi chỉ còn admin trong dữ liệu, bảng không hiển thị khách hàng thường", () => {
    mockAdminWorkspace("/admin/users", {
      users: [
        {
          id: 1,
          name: "Admin",
          email: "admin@cosmetics.local",
          role: "admin",
          created_at: "2026-05-01T08:00:00.000Z",
        },
      ],
      orders: [],
    });

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.contains(".customer-stat-card", "Tổng khách hàng").should("contain.text", "1");
    cy.get(".customer-table tbody tr").should("have.length", 1);
    cy.contains(".customer-table tbody tr", "Admin").should("exist");
  });

  it("E2E1: Admin tìm khách hàng rồi mở liên kết gửi mail đúng email", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.get('.product-admin-search input[type="search"]').type("minh@example.com");
    cy.contains(".customer-table tbody tr", "Minh Tran")
      .find('a[href="mailto:minh@example.com"]')
      .should("exist");
  });

  it("E2E2: Admin xem danh sách khách hàng rồi điều hướng phân trang vẫn giữ shell quản trị", () => {
    mockAdminWorkspace("/admin/users");

    cy.wait("@getUsers");
    cy.wait("@getAdminOrders");

    cy.contains(".customer-sidebar, .admin-sidebar", "Quản Lý Khách Hàng").should("exist");
    cy.contains(".customer-footer", "Trang 1/1").should("exist");
    cy.contains(".customer-table tbody tr", "Alice Nguyen").should("exist");
    cy.contains(".customer-table tbody tr", "Minh Tran").should("exist");
  });
});
