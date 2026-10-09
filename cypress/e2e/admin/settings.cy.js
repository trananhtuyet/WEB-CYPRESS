describe("Dolia Shop - Cài đặt cửa hàng admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  const visitSettings = () => {
    cy.intercept("GET", "**/api/users/1", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Admin",
        email: "admin@cosmetics.local",
        role: "admin",
      },
    }).as("getAdminUser");

    cy.visit("/admin/settings", {
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

  it("DV1: Trang cài đặt hiển thị đầy đủ các nhóm thông tin vận hành", () => {
    visitSettings();

    cy.contains("h1", "Cài đặt cửa hàng").should("be.visible");
    cy.contains("h2", "Thông tin cửa hàng").should("be.visible");
    cy.contains("h2", "Vận hành đơn hàng").should("be.visible");
    cy.contains("h2", "Thanh toán và an toàn").should("be.visible");
    cy.get('input[type="checkbox"]').should("have.length", 3);
  });

  it("DV2: Trang cài đặt nạp dữ liệu đã lưu sẵn từ localStorage khi mở lại", () => {
    cy.intercept("GET", "**/api/users/1", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Admin",
        email: "admin@cosmetics.local",
        role: "admin",
      },
    }).as("getAdminUser");

    cy.visit("/admin/settings", {
      onBeforeLoad(window) {
        window.localStorage.clear();
        window.localStorage.setItem("token", "mock-admin-token");
        window.localStorage.setItem("user", JSON.stringify({
          id: 1,
          name: "Admin",
          email: "admin@cosmetics.local",
          role: "admin",
        }));
        window.localStorage.setItem("dolia_admin_settings", JSON.stringify({
          storeName: "Dolia Test Store",
          storeEmail: "ops@dolia.vn",
          freeShippingFrom: 555000,
          maintenanceMode: true,
        }));
      },
    });

    cy.wait("@getAdminUser");
    cy.get('input[type="email"]').should("have.value", "ops@dolia.vn");
    cy.get('input[type="number"]').eq(0).should("have.value", "555000");
    cy.get('input[type="checkbox"]').eq(2).should("be.checked");
  });

  it("API1: Lưu cài đặt ghi đúng cấu hình xuống localStorage", () => {
    visitSettings();

    cy.get('input[type="email"]').clear().type("support@dolia.vn");
    cy.get('input[type="number"]').eq(0).clear().type("799000");
    cy.get('input[type="checkbox"]').eq(2).check({ force: true });
    cy.contains('button[type="submit"]', "Lưu cài đặt").click();

    cy.contains(".toast", "Đã lưu cài đặt cửa hàng").should("exist");
    cy.window().then((window) => {
      const stored = JSON.parse(window.localStorage.getItem("dolia_admin_settings"));
      expect(stored.storeEmail).to.equal("support@dolia.vn");
      expect(stored.freeShippingFrom).to.equal(799000);
      expect(stored.maintenanceMode).to.equal(true);
    });
  });

  it("API2: Lưu các công tắc vận hành và ngưỡng tồn kho đúng xuống localStorage", () => {
    visitSettings();

    cy.get('input[type="number"]').eq(1).clear().type("4");
    cy.get('input[type="checkbox"]').eq(0).uncheck({ force: true });
    cy.get('input[type="checkbox"]').eq(1).uncheck({ force: true });
    cy.contains('button[type="submit"]', "Lưu cài đặt").click();

    cy.window().then((window) => {
      const stored = JSON.parse(window.localStorage.getItem("dolia_admin_settings"));
      expect(stored.lowStockThreshold).to.equal(4);
      expect(stored.autoConfirmPaidOrders).to.equal(false);
      expect(stored.allowDemoWallet).to.equal(false);
    });
  });

  it("VAL1: Input email hỗ trợ tuân theo ràng buộc email hợp lệ của trình duyệt", () => {
    visitSettings();

    cy.get('input[type="email"]').clear().type("invalid-email");
    cy.contains('button[type="submit"]', "Lưu cài đặt").click();

    cy.get('input[type="email"]').then(([input]) => {
      expect(input.checkValidity()).to.equal(false);
      expect(input.validationMessage).not.to.equal("");
    });
  });

  it("VAL2: Giá trị miễn phí vận chuyển âm bị chặn bởi min validation", () => {
    visitSettings();

    cy.get('input[type="number"]').eq(0).clear().type("-1");
    cy.contains('button[type="submit"]', "Lưu cài đặt").click();

    cy.get('input[type="number"]').eq(0).then(([input]) => {
      expect(input.checkValidity()).to.equal(false);
      expect(input.validationMessage).not.to.equal("");
    });
  });

  it("NEG1: Dữ liệu settings lỗi JSON vẫn fallback về mặc định", () => {
    cy.intercept("GET", "**/api/users/1", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Admin",
        email: "admin@cosmetics.local",
        role: "admin",
      },
    }).as("getAdminUser");

    cy.visit("/admin/settings", {
      onBeforeLoad(window) {
        window.localStorage.clear();
        window.localStorage.setItem("token", "mock-admin-token");
        window.localStorage.setItem("user", JSON.stringify({
          id: 1,
          name: "Admin",
          email: "admin@cosmetics.local",
          role: "admin",
        }));
        window.localStorage.setItem("dolia_admin_settings", "{bad-json");
      },
    });

    cy.wait("@getAdminUser");

    cy.get('input[type="email"]').should("have.value", "hello@dolia.vn");
    cy.get('input[type="time"]').first().should("have.value", "09:00");
  });

  it("NEG2: Mở lại trang khi không có settings đã lưu vẫn render mặc định an toàn", () => {
    visitSettings();

    cy.window().then((window) => {
      window.localStorage.removeItem("dolia_admin_settings");
    });
    cy.reload();
    cy.wait("@getAdminUser");

    cy.get('input[type="email"]').should("have.value", "hello@dolia.vn");
    cy.get('input[type="checkbox"]').eq(0).should("be.checked");
  });

  it("E2E1: Khôi phục mặc định đưa toàn bộ cài đặt về giá trị ban đầu", () => {
    visitSettings();

    cy.get('input[type="email"]').clear().type("support@dolia.vn");
    cy.get('input[type="checkbox"]').eq(2).check({ force: true });
    cy.contains("button", "Khôi phục mặc định").click();

    cy.contains(".toast", "Đã khôi phục cài đặt mặc định").should("exist");
    cy.get('input[type="email"]').should("have.value", "hello@dolia.vn");
    cy.get('input[type="checkbox"]').eq(2).should("not.be.checked");
  });

  it("E2E2: Save rồi reload vẫn giữ nguyên cấu hình đã lưu", () => {
    visitSettings();

    cy.get('input[type="email"]').clear().type("ops@dolia.vn");
    cy.get('input[type="time"]').first().clear().type("08:30");
    cy.contains('button[type="submit"]', "Lưu cài đặt").click();

    cy.reload();
    cy.wait("@getAdminUser");
    cy.get('input[type="email"]').should("have.value", "ops@dolia.vn");
    cy.get('input[type="time"]').first().should("have.value", "08:30");
  });
});
