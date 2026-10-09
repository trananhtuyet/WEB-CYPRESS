describe("Dolia Shop - Phân hệ xác thực", () => {
  const userResponse = {
    user: {
      id: 2,
      name: "Alice",
      email: "alice@example.com",
      role: "user",
      phone: "0123",
      address: "123 Beauty Street",
    },
    token: "mock-user-token",
  };

  const adminResponse = {
    user: {
      id: 1,
      name: "Admin",
      email: "admin@cosmetics.local",
      role: "admin",
    },
    token: "mock-admin-token",
  };

  const loginUrl = `${Cypress.config("baseUrl")}/login`;
  const registerUrl = `${Cypress.config("baseUrl")}/register`;
  const forgotUrl = `${Cypress.config("baseUrl")}/forgot-password`;
  const homeUrl = `${Cypress.config("baseUrl")}/`;
  const adminUrl = `${Cypress.config("baseUrl")}/admin`;

  const mockUserProfile = (user = userResponse.user) => {
    cy.intercept("GET", `**/api/users/${user.id}`, {
      statusCode: 200,
      body: user,
    }).as("getCurrentUser");
  };

  const mockLoginSuccess = (response = userResponse) => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: response,
    }).as("login");
  };

  const mockLoginFailure = (statusCode = 401, body = { message: "Invalid email or password" }) => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode,
      body,
    }).as("login");
  };

  const mockRegisterSuccess = (response = userResponse) => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 201,
      body: response,
    }).as("register");
  };

  const mockRegisterFailure = (statusCode = 409, body = { message: "Email already exists" }) => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode,
      body,
    }).as("register");
  };

  const visitLoginPage = () => {
    cy.mockCatalog();
    cy.visit("/login");
  };

  const visitRegisterPage = () => {
    cy.mockCatalog();
    cy.visit("/register");
  };

  const visitForgotPasswordPage = () => {
    cy.mockCatalog();
    cy.visit("/forgot-password");
  };

  const fillLoginForm = ({ email = "alice@example.com", password = "Password@123" } = {}) => {
    if (email !== null) cy.get("#email").clear().type(email);
    if (password !== null) cy.get("#password").clear().type(password);
  };

  const fillRegisterForm = ({
    name = "Alice",
    phone = "0123",
    email = "alice@example.com",
    password = "Password@123",
  } = {}) => {
    if (name !== null) cy.get("#name").clear().type(name);
    if (phone !== null) cy.get("#phone").clear().type(phone);
    if (email !== null) cy.get("#email").clear().type(email);
    if (password !== null) cy.get("#password").clear().type(password);
  };

  const submitPrimaryAuthForm = (label) => {
    cy.contains('button[type="submit"]', label).click();
  };

  const expectNoAuthSession = () => {
    cy.window().then((window) => {
      expect(window.localStorage.getItem("token")).to.equal(null);
      expect(window.localStorage.getItem("user")).to.equal(null);
    });
  };

  const loginAsUser = () => {
    cy.mockCartFlow();
    mockLoginSuccess(userResponse);
    mockUserProfile();

    visitLoginPage();
    fillLoginForm();
    submitPrimaryAuthForm("Đăng nhập");

    cy.wait("@login");
    cy.wait("@getCurrentUser");
    cy.wait("@getCart");
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe("Đăng nhập", () => {
    it("DV1: Các thành phần của biểu mẫu đăng nhập được hiển thị", () => {
      visitLoginPage();

      cy.get("#email").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.contains('button[type="submit"]', "Đăng nhập").should("be.visible");
      cy.contains("a", "Quên mật khẩu?").should("be.visible");
      cy.contains(".auth-luxe-note", "Tài khoản test:").should("be.visible");
    });

    it("DV2: Biểu mẫu đăng nhập hiển thị đúng placeholder và phần trợ giúp", () => {
      visitLoginPage();

      cy.get("#email").should("have.attr", "placeholder", "admin@cosmetics.local");
      cy.get("#password").should("have.attr", "placeholder", "Nhập mật khẩu");
      cy.contains(".auth-luxe-note", "admin@cosmetics.local").should("exist");
      cy.contains(".auth-luxe-note", "Admin@123").should("exist");
    });

    it("DV3: Biểu mẫu đăng nhập chấp nhận dữ liệu người dùng nhập", () => {
      visitLoginPage();

      cy.get("#email").type("alice@example.com").should("have.value", "alice@example.com");
      cy.get("#password").type("Password@123").should("have.value", "Password@123");
    });

    it("API1: Đăng nhập người dùng hợp lệ sẽ chuyển hướng về trang chủ và lưu phiên", () => {
      cy.mockCartFlow();
      mockLoginSuccess(userResponse);
      mockUserProfile();

      visitLoginPage();
      fillLoginForm();
      submitPrimaryAuthForm("Đăng nhập");

      cy.wait("@login").its("request.body").should("deep.equal", {
        email: "alice@example.com",
        password: "Password@123",
      });
      cy.wait("@getCurrentUser");
      cy.wait("@getCart");

      cy.url().should("eq", homeUrl);
      cy.contains(".toast", "Đăng nhập thành công").should("exist");
      cy.contains("strong", "Alice").should("exist");
      cy.window().then((window) => {
        expect(window.localStorage.getItem("token")).to.equal("mock-user-token");
        expect(JSON.parse(window.localStorage.getItem("user"))).to.deep.include({
          id: 2,
          email: "alice@example.com",
          role: "user",
        });
      });
    });

    it("API2: Đăng nhập admin hợp lệ sẽ chuyển hướng đến dashboard quản trị", () => {
      mockLoginSuccess(adminResponse);
      mockUserProfile(adminResponse.user);

      visitLoginPage();
      fillLoginForm({
        email: "admin@cosmetics.local",
        password: "Admin@123",
      });
      submitPrimaryAuthForm("Đăng nhập");

      cy.wait("@login").its("request.body").should("deep.equal", {
        email: "admin@cosmetics.local",
        password: "Admin@123",
      });
      cy.wait("@getCurrentUser");

      cy.url().should("eq", adminUrl);
      cy.contains("strong", "Admin").should("exist");
    });

    it("API3: Phiên đã đăng nhập vẫn được giữ sau khi tải lại trang", () => {
      loginAsUser();

      cy.reload();
      cy.wait("@getCurrentUser");
      cy.wait("@getCart");
      cy.url().should("eq", homeUrl);
      cy.contains("strong", "Alice").should("exist");
    });

    it("VAL1: Mật khẩu không hợp lệ sẽ hiển thị thông báo lỗi từ backend", () => {
      mockLoginFailure(401, { message: "Invalid email or password" });

      visitLoginPage();
      fillLoginForm({ password: "WrongPassword@123" });
      submitPrimaryAuthForm("Đăng nhập");

      cy.wait("@login");
      cy.url().should("eq", loginUrl);
      cy.contains(".toast", "Invalid email or password").should("exist");
      expectNoAuthSession();
    });

    it("VAL2: Email trống sẽ chặn gửi biểu mẫu", () => {
      visitLoginPage();

      cy.get("#password").type("Password@123");
      submitPrimaryAuthForm("Đăng nhập");

      cy.get("#email").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });

    it("VAL3: Mật khẩu trống sẽ chặn gửi biểu mẫu", () => {
      visitLoginPage();

      cy.get("#email").type("alice@example.com");
      submitPrimaryAuthForm("Đăng nhập");

      cy.get("#password").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });

    it("VAL4: Định dạng email không hợp lệ sẽ bị chặn bởi validation của trình duyệt", () => {
      visitLoginPage();

      fillLoginForm({
        email: "alice-example.com",
        password: "Password@123",
      });
      submitPrimaryAuthForm("Đăng nhập");

      cy.get("#email").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });

    it("NEG1: Nhiều lần đăng nhập thất bại vẫn tiếp tục hiển thị lỗi", () => {
      let attempt = 0;

      cy.intercept("POST", "**/api/auth/login", (req) => {
        attempt += 1;
        req.reply({
          statusCode: 401,
          body: { message: `Invalid email or password (attempt ${attempt})` },
        });
      }).as("login");

      visitLoginPage();
      fillLoginForm({ password: "wrong-1" });
      submitPrimaryAuthForm("Đăng nhập");
      cy.wait("@login");
      cy.contains(".toast", "Invalid email or password (attempt 1)").should("exist");

      cy.get("#password").clear().type("wrong-2");
      submitPrimaryAuthForm("Đăng nhập");
      cy.wait("@login");
      cy.contains(".toast", "Invalid email or password (attempt 2)").should("exist");
      expectNoAuthSession();
    });

    it("NEG2: Lỗi máy chủ sẽ hiển thị thông báo đăng nhập fallback", () => {
      mockLoginFailure(500, {});

      visitLoginPage();
      fillLoginForm();
      submitPrimaryAuthForm("Đăng nhập");

      cy.wait("@login");
      cy.contains(".toast", "Đăng nhập thất bại").should("exist");
      expectNoAuthSession();
    });

    it("NEG3: Yêu cầu đăng nhập có khoảng trắng đầu cuối vẫn được gửi đúng như đã nhập", () => {
      cy.mockCartFlow();
      mockLoginSuccess(userResponse);
      mockUserProfile();

      visitLoginPage();
      fillLoginForm({
        email: " alice@example.com ",
        password: " Password@123 ",
      });
      submitPrimaryAuthForm("Đăng nhập");

      cy.wait("@login").its("request.body").should("deep.equal", {
        email: " alice@example.com ",
        password: " Password@123 ",
      });
    });
  });

  describe("Đăng ký", () => {
    it("DV5: Các thành phần của biểu mẫu đăng ký được hiển thị", () => {
      visitRegisterPage();

      cy.get("#name").should("be.visible");
      cy.get("#phone").should("be.visible");
      cy.get("#email").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.contains('button[type="submit"]', "Đăng ký").should("be.visible");
      cy.contains("a", "Đăng nhập ngay").should("be.visible");
    });

    it("API4: Đăng ký hợp lệ sẽ tạo tài khoản, lưu phiên và chuyển hướng về trang chủ", () => {
      mockRegisterSuccess(userResponse);
      mockUserProfile();

      visitRegisterPage();
      fillRegisterForm();
      submitPrimaryAuthForm("Đăng ký");

      cy.wait("@register").its("request.body").should("deep.equal", {
        name: "Alice",
        email: "alice@example.com",
        password: "Password@123",
        phone: "0123",
      });
      cy.wait("@getCurrentUser");

      cy.url().should("eq", homeUrl);
      cy.contains(".toast", "Đăng ký thành công").should("exist");
      cy.window().then((window) => {
        expect(window.localStorage.getItem("token")).to.equal("mock-user-token");
        expect(JSON.parse(window.localStorage.getItem("user"))).to.deep.include({
          id: 2,
          email: "alice@example.com",
        });
      });
    });

    it("VAL5: Tên trống sẽ chặn gửi biểu mẫu đăng ký", () => {
      visitRegisterPage();

      fillRegisterForm({ name: null });
      cy.get("#name").clear();
      submitPrimaryAuthForm("Đăng ký");

      cy.get("#name").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });

    it("VAL6: Email trống sẽ chặn gửi biểu mẫu đăng ký", () => {
      visitRegisterPage();

      fillRegisterForm({ email: null });
      cy.get("#email").clear();
      submitPrimaryAuthForm("Đăng ký");

      cy.get("#email").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });

    it("VAL7: Định dạng email không hợp lệ sẽ bị chặn trên biểu mẫu đăng ký", () => {
      visitRegisterPage();

      fillRegisterForm({ email: "alice-example.com" });
      submitPrimaryAuthForm("Đăng ký");

      cy.get("#email").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });

    it("NEG4: Đăng ký bằng email đã tồn tại sẽ hiển thị lỗi từ backend", () => {
      mockRegisterFailure(409, { message: "Email already exists" });

      visitRegisterPage();
      fillRegisterForm();
      submitPrimaryAuthForm("Đăng ký");

      cy.wait("@register");
      cy.url().should("eq", registerUrl);
      cy.contains(".toast", "Email already exists").should("exist");
      expectNoAuthSession();
    });
  });

  describe("Quên mật khẩu", () => {
    it("DV6: Các thành phần của biểu mẫu quên mật khẩu được hiển thị", () => {
      visitForgotPasswordPage();

      cy.get("#forgot-email").should("be.visible");
      cy.contains('button[type="submit"]', "Gửi hướng dẫn").should("be.visible");
      cy.contains("a", "Đăng nhập ngay").should("be.visible");
    });

    it("API5: Gửi biểu mẫu quên mật khẩu sẽ hiển thị trạng thái thành công", () => {
      visitForgotPasswordPage();

      cy.get("#forgot-email").type("alice@example.com");
      submitPrimaryAuthForm("Gửi hướng dẫn");

      cy.contains(".toast", "Đã ghi nhận yêu cầu đặt lại mật khẩu").should("exist");
      cy.get(".auth-luxe-note").should("have.class", "success");
    });

    it("VAL8: Email quên mật khẩu trống sẽ bị chặn bởi validation của trình duyệt", () => {
      visitForgotPasswordPage();

      submitPrimaryAuthForm("Gửi hướng dẫn");

      cy.get("#forgot-email").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });

    it("VAL9: Định dạng email quên mật khẩu không hợp lệ sẽ bị chặn", () => {
      visitForgotPasswordPage();

      cy.get("#forgot-email").type("alice-example.com");
      submitPrimaryAuthForm("Gửi hướng dẫn");

      cy.get("#forgot-email").then(([input]) => {
        expect(input.checkValidity()).to.equal(false);
        expect(input.validationMessage).not.to.equal("");
      });
    });
  });

  describe("Phiên đăng nhập và đăng xuất", () => {
    it("E2E1: Luồng đăng nhập hoàn chỉnh cho phép người dùng mở trang giỏ hàng", () => {
      loginAsUser();

      cy.contains('a[aria-label="Giỏ hàng"]', "1").should("exist");
      cy.get('a[aria-label="Giỏ hàng"]').click();
      cy.url().should("include", "/cart");
      cy.contains("Thanh toán").should("exist");
    });

    it("E2E2: Người dùng có thể đăng xuất sau khi đăng nhập thành công", () => {
      loginAsUser();

      cy.get('button[aria-label="Đăng xuất"]').click();
      cy.url().should("eq", loginUrl);
      cy.contains("a", "Đăng nhập").should("exist");
      expectNoAuthSession();
    });

    it("NEG5: Truy cập trang đăng nhập sau khi đăng xuất sẽ không khôi phục phiên cũ", () => {
      loginAsUser();

      cy.get('button[aria-label="Đăng xuất"]').click();
      visitLoginPage();
      expectNoAuthSession();
      cy.contains('button[type="submit"]', "Đăng nhập").should("be.visible");
    });
  });
});
