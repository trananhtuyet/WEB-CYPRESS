describe("Dolia Shop - Cài đặt thanh toán admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  const visitPaymentSettings = () => {
    cy.intercept("GET", "**/api/users/1", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Admin",
        email: "admin@cosmetics.local",
        role: "admin",
      },
    }).as("getAdminUser");

    cy.visit("/admin/payments", {
      onBeforeLoad(window) {
        window.localStorage.clear();
        window.localStorage.setItem("token", "mock-admin-token");
        window.localStorage.setItem("user", JSON.stringify({
          id: 1,
          name: "Admin",
          email: "admin@cosmetics.local",
          role: "admin",
        }));
      },
    });

    cy.wait("@getAdminUser");
  };

  it("DV1: Trang QR thanh toán hiển thị form cấu hình và ảnh preview", () => {
    visitPaymentSettings();

    cy.contains("h1", "QR thanh toán ngân hàng").should("be.visible");
    cy.contains("h2", "Thông tin tài khoản nhận tiền").should("be.visible");
    cy.get('input[placeholder="Nhập số tài khoản nhận tiền"]').should("have.value", "0123456789");
    cy.get('input[placeholder="Tên chủ tài khoản"]').should("have.value", "TRAN ANH TUYET");
    cy.get(".payment-admin-preview img").should("have.attr", "src").and("include", "vietqr");
  });

  it("DV2: Đổi ngân hàng và số tiền xem trước cập nhật đúng QR preview", () => {
    visitPaymentSettings();

    cy.get("select").select("Techcombank");
    cy.get('input[type="number"]').clear().type("450000");

    cy.get(".payment-admin-preview img")
      .should("have.attr", "src")
      .and("include", "TCB-0123456789")
      .and("include", "amount=450000");
    cy.get(".payment-admin-preview").should("contain.text", "TCB");
  });

  it("API1: Lưu cấu hình QR ghi xuống localStorage và hiển thị preview mới", () => {
    visitPaymentSettings();

    cy.get('input[placeholder="Nhập số tài khoản nhận tiền"]').clear().type("9988776655");
    cy.get('input[placeholder="Tên chủ tài khoản"]').clear().type("nguyen van a");
    cy.get('input[placeholder="VD: DOLIA"]').clear().type("shop");
    cy.contains('button[type="submit"]', "Lưu mã QR").click();

    cy.contains(".toast", "Đã lưu QR thanh toán ngân hàng").should("exist");
    cy.window().then((window) => {
      const stored = JSON.parse(window.localStorage.getItem("dolia_bank_payment_config"));
      expect(stored.accountNumber).to.equal("9988776655");
      expect(stored.accountName).to.equal("NGUYEN VAN A");
      expect(stored.transferNotePrefix).to.equal("SHOP");
    });
    cy.get(".payment-admin-preview").should("contain.text", "NGUYEN VAN A");
    cy.get(".payment-admin-preview").should("contain.text", "9988776655");
  });

  it("API2: Tải ảnh QR tùy chỉnh cập nhật preview và được lưu sau khi save", () => {
    visitPaymentSettings();

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from("fake-image"),
      fileName: "qr.png",
      mimeType: "image/png",
    }, { force: true });

    cy.contains(".toast", "Đã chọn ảnh QR cửa hàng").should("exist");
    cy.get(".payment-admin-preview img").should("have.attr", "src").and("contain", "data:image/png");

    cy.contains('button[type="submit"]', "Lưu mã QR").click();
    cy.window().then((window) => {
      const stored = JSON.parse(window.localStorage.getItem("dolia_bank_payment_config"));
      expect(stored.customQrImage).to.contain("data:image/png");
    });
  });

  it("VAL1: Tên chủ tài khoản tự động chuyển thành chữ in hoa", () => {
    visitPaymentSettings();

    cy.get('input[placeholder="Tên chủ tài khoản"]').clear().type("tran thi b");
    cy.get('input[placeholder="Tên chủ tài khoản"]').should("have.value", "TRAN THI B");
  });

  it("VAL2: Thiếu số tài khoản chặn submit bằng validation của trình duyệt", () => {
    visitPaymentSettings();

    cy.get('input[placeholder="Nhập số tài khoản nhận tiền"]').clear();
    cy.contains('button[type="submit"]', "Lưu mã QR").click();

    cy.get('input[placeholder="Nhập số tài khoản nhận tiền"]').then(([input]) => {
      expect(input.checkValidity()).to.equal(false);
      expect(input.validationMessage).not.to.equal("");
    });
  });

  it("NEG1: Chọn file không phải ảnh cho QR hiển thị lỗi và không đổi preview", () => {
    visitPaymentSettings();

    cy.get('.payment-admin-preview img').invoke("attr", "src").as("initialQr");
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from("not-an-image"),
      fileName: "qr.txt",
      mimeType: "text/plain",
    }, { force: true });

    cy.contains(".toast", "Vui lòng chọn file ảnh QR").should("exist");
    cy.get("@initialQr").then((initialQr) => {
      cy.get(".payment-admin-preview img").should("have.attr", "src", initialQr);
    });
  });

  it("NEG2: Dữ liệu QR lỗi JSON vẫn fallback về cấu hình mặc định", () => {
    cy.intercept("GET", "**/api/users/1", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Admin",
        email: "admin@cosmetics.local",
        role: "admin",
      },
    }).as("getAdminUser");

    cy.visit("/admin/payments", {
      onBeforeLoad(window) {
        window.localStorage.clear();
        window.localStorage.setItem("token", "mock-admin-token");
        window.localStorage.setItem("user", JSON.stringify({
          id: 1,
          name: "Admin",
          email: "admin@cosmetics.local",
          role: "admin",
        }));
        window.localStorage.setItem("dolia_bank_payment_config", "{bad-json");
      },
    });

    cy.wait("@getAdminUser");
    cy.get('input[placeholder="Nhập số tài khoản nhận tiền"]').should("have.value", "0123456789");
    cy.get('input[placeholder="Tên chủ tài khoản"]').should("have.value", "TRAN ANH TUYET");
  });

  it("E2E1: Khôi phục mặc định trả cấu hình QR về giá trị ban đầu", () => {
    visitPaymentSettings();

    cy.get('input[placeholder="Nhập số tài khoản nhận tiền"]').clear().type("9988776655");
    cy.contains("button", "Khôi phục mặc định").click();

    cy.contains(".toast", "Đã khôi phục cấu hình mặc định").should("exist");
    cy.get('input[placeholder="Nhập số tài khoản nhận tiền"]').should("have.value", "0123456789");
    cy.get('input[placeholder="Tên chủ tài khoản"]').should("have.value", "TRAN ANH TUYET");
  });

  it("E2E2: Admin có thể quay về QR tự động sau khi đã chọn ảnh QR tùy chỉnh", () => {
    visitPaymentSettings();

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from("fake-image"),
      fileName: "qr.png",
      mimeType: "image/png",
    }, { force: true });
    cy.get(".payment-admin-preview img").should("have.attr", "src").and("contain", "data:image/png");

    cy.contains("button", "Dùng lại QR tự động theo số tiền").click();
    cy.get(".payment-admin-preview img").should("have.attr", "src").and("include", "vietqr");
  });
});
