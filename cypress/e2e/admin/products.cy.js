const { expectRequestField, mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Quản lý sản phẩm admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang quản lý sản phẩm hiển thị bảng, bộ lọc và trạng thái tồn kho", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains("h1", "Quản Lý Sản Phẩm").should("be.visible");
    cy.get('.product-admin-toolbar input[type="search"]').should("have.attr", "placeholder", "Tìm theo tên, SKU, barcode...");
    cy.contains(".product-admin-table tbody tr", "Dolia Blazer Modern").should("contain.text", "Nháp");
    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed").should("contain.text", "Đang bán");
    cy.contains(".product-admin-table tbody tr", "Dolia Street Sneaker").should("contain.text", "Nháp");
  });

  it("DV2: Bộ lọc sản phẩm theo danh mục, trạng thái và kho hoạt động đúng", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.get('.product-admin-toolbar select').eq(0).select("Áo");
    cy.contains(".product-admin-table tbody tr", "Dolia Blazer Modern").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed").should("not.exist");

    cy.get('.product-admin-toolbar select').eq(0).select("");
    cy.get('.product-admin-toolbar select').eq(1).select("Đang bán");
    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Blazer Modern").should("not.exist");

    cy.get('.product-admin-toolbar select').eq(1).select("");
    cy.get('.product-admin-toolbar select').eq(3).select("Sắp hết");
    cy.contains(".product-admin-table tbody tr", "Dolia Blazer Modern").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Street Sneaker").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed").should("not.exist");
  });

  it("API1: Admin có thể thêm sản phẩm mới từ drawer", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains("button", "Thêm Sản Phẩm Mới").click();
    cy.contains('[role="dialog"] h2', "Thêm Sản Phẩm Mới").should("be.visible");

    cy.get('input[name="name"]').type("Dolia Linen Shirt");
    cy.get('input[name="price"]').type("990000");
    cy.get('textarea[name="description"]').type("Áo linen mùa hè.");
    cy.get('input[name="stock"]').type("16");
    cy.get('select[name="category_id"]').select("1");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Thêm Sản Phẩm").click();

    cy.wait("@createProduct").then(({ request }) => {
      expect(request.headers["content-type"]).to.include("multipart/form-data");
      expectRequestField(request.body, "name", "Dolia Linen Shirt");
      expectRequestField(request.body, "price", "990000");
      expectRequestField(request.body, "description", "Áo linen mùa hè.");
      expectRequestField(request.body, "stock", "16");
      expectRequestField(request.body, "category_id", "1");
    });

    cy.wait("@getProducts");
    cy.contains(".toast", "Product created").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Linen Shirt").should("exist");
  });

  it("API2: Tìm kiếm sản phẩm đồng bộ với query string và thu hẹp bảng dữ liệu", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.get('.product-admin-toolbar input[type="search"]').type("Sneaker");

    cy.url().should("include", "/admin/products?search=Sneaker");
    cy.contains(".product-admin-table tbody tr", "Dolia Street Sneaker").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Blazer Modern").should("not.exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed").should("not.exist");
  });

  it("VAL1: Form thêm sản phẩm chặn submit khi thiếu tên sản phẩm bắt buộc", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains("button", "Thêm Sản Phẩm Mới").click();
    cy.get('input[name="price"]').type("990000");
    cy.get('textarea[name="description"]').type("Áo linen mùa hè.");
    cy.get('input[name="stock"]').type("16");
    cy.get('select[name="category_id"]').select("1");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Thêm Sản Phẩm").click();

    cy.get('input[name="name"]').then(([input]) => {
      expect(input.checkValidity()).to.equal(false);
      expect(input.validationMessage).not.to.equal("");
    });
  });

  it("VAL2: Form thêm sản phẩm chặn submit khi chưa chọn danh mục", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains("button", "Thêm Sản Phẩm Mới").click();
    cy.get('input[name="name"]').type("Dolia Linen Shirt");
    cy.get('input[name="price"]').type("990000");
    cy.get('textarea[name="description"]').type("Áo linen mùa hè.");
    cy.get('input[name="stock"]').type("16");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Thêm Sản Phẩm").click();

    cy.get('select[name="category_id"]').then(([input]) => {
      expect(input.checkValidity()).to.equal(false);
      expect(input.validationMessage).not.to.equal("");
    });
  });

  it("NEG1: Lưu sản phẩm thất bại hiển thị thông báo lỗi từ backend", () => {
    mockAdminWorkspace("/admin/products", {
      createProductStatusCode: 500,
      createProductBody: { message: "Save failed" },
    });

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains("button", "Thêm Sản Phẩm Mới").click();
    cy.get('input[name="name"]').type("Dolia Linen Shirt");
    cy.get('input[name="price"]').type("990000");
    cy.get('textarea[name="description"]').type("Áo linen mùa hè.");
    cy.get('input[name="stock"]').type("16");
    cy.get('select[name="category_id"]').select("1");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Thêm Sản Phẩm").click();

    cy.wait("@createProduct");
    cy.contains(".toast", "Save failed").should("exist");
    cy.contains('[role="dialog"] h2', "Thêm Sản Phẩm Mới").should("be.visible");
  });

  it("NEG2: Cập nhật sản phẩm thất bại giữ nguyên drawer chỉnh sửa và hiện lỗi", () => {
    mockAdminWorkspace("/admin/products", {
      updateProductStatusCode: 500,
      updateProductBody: { message: "Update failed" },
    });

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed")
      .find('button[title="Sửa"]')
      .click();

    cy.get('input[name="name"]').clear().type("Dolia Denim Relaxed Updated");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Cập Nhật").click();

    cy.wait("@updateProduct");
    cy.contains(".toast", "Update failed").should("exist");
    cy.contains('[role="dialog"] h2', "Cập Nhật Sản Phẩm").should("be.visible");
  });

  it("E2E1: Admin có thể sửa rồi xóa một sản phẩm trong cùng phiên quản trị", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed")
      .find('button[title="Sửa"]')
      .click();

    cy.get('input[name="name"]').clear().type("Dolia Denim Relaxed Updated");
    cy.get('input[name="price"]').clear().type("910000");
    cy.get('textarea[name="description"]').clear().type("Quần denim form suông đã cập nhật.");
    cy.get('input[name="stock"]').clear().type("18");
    cy.contains('.product-admin-form-actions button[type="submit"]', "Cập Nhật").click();

    cy.wait("@updateProduct").then(({ request }) => {
      expect(request.headers["content-type"]).to.include("multipart/form-data");
      expectRequestField(request.body, "name", "Dolia Denim Relaxed Updated");
      expectRequestField(request.body, "price", "910000");
      expectRequestField(request.body, "stock", "18");
    });

    cy.wait("@getProducts");
    cy.contains(".toast", "Product updated").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Denim Relaxed Updated").should("exist");

    cy.contains(".product-admin-table tbody tr", "Dolia Street Sneaker")
      .find('button[title="Xóa"]')
      .click();

    cy.wait("@deleteProduct");
    cy.wait("@getProducts");
    cy.contains(".toast", "Product deleted").should("exist");
    cy.contains(".product-admin-table tbody tr", "Dolia Street Sneaker").should("not.exist");
  });

  it("E2E2: Admin có thể chọn tất cả sản phẩm đang hiển thị rồi hủy chọn", () => {
    mockAdminWorkspace("/admin/products");

    cy.wait("@getCategories");
    cy.wait("@getProducts");

    cy.get('.product-admin-table thead input[type="checkbox"]').check({ force: true });
    cy.contains(".product-admin-footer", "Đã chọn: 3 sản phẩm").should("exist");
    cy.get(".product-admin-table tbody tr.selected").should("have.length", 3);

    cy.get('.product-admin-table thead input[type="checkbox"]').uncheck({ force: true });
    cy.contains(".product-admin-footer", "Đã chọn: 0 sản phẩm").should("exist");
    cy.get(".product-admin-table tbody tr.selected").should("have.length", 0);
  });
});
