describe("Dolia Shop - Phân hệ giỏ hàng", () => {
  const user = {
    id: 2,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    phone: "0123",
    address: "123 Beauty Street",
  };

  const cartWithItems = {
    id: 1,
    user_id: 2,
    items: [
      {
        id: 1,
        product_id: 1,
        quantity: 2,
        product: {
          id: 1,
          name: "Radiance Glow Serum",
          price: 299000,
          image: "https://images.example.com/serum.jpg",
          category: { name: "Serum" },
        },
      },
      {
        id: 2,
        product_id: 2,
        quantity: 1,
        product: {
          id: 2,
          name: "Velvet Matte Lipstick",
          price: 199000,
          image: "https://images.example.com/lipstick.jpg",
          category: { name: "Son" },
        },
      },
    ],
    totalPrice: 797000,
  };

  const emptyCart = {
    id: 1,
    user_id: 2,
    items: [],
    totalPrice: 0,
  };

  const cartUrl = `${Cypress.config("baseUrl")}/cart`;
  const checkoutUrl = `${Cypress.config("baseUrl")}/checkout`;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const expectSummaryTotal = (expectedTotal) => {
    cy.get(".fashion-cart-summary").within(() => {
      cy.contains("p", "Tóm tắt đơn hàng").should("exist");
      cy.get("h2").should("contain.text", formatCurrency(expectedTotal));
      cy.contains("span", "Tạm tính")
        .parent()
        .should("contain.text", formatCurrency(expectedTotal));
    });
  };

  const expectSummarySelectedCount = (selectedCount, itemCount) => {
    cy.get(".fashion-cart-summary").within(() => {
      cy.contains("span", "Đã chọn")
        .parent()
        .find("strong")
        .should("contain.text", `${selectedCount} / ${itemCount} sản phẩm`);
    });
  };

  const expectCartItemTotal = (productName, expectedTotal) => {
    cy.contains(productName)
      .closest(".fashion-cart-item")
      .find("strong")
      .should("contain.text", formatCurrency(expectedTotal));
  };

  const waitForCartUpdateQuantity = (expectedQuantity) => {
    cy.wait("@updateCart").then(({ request }) => {
      if (Number(request.body?.quantity) !== expectedQuantity) {
        waitForCartUpdateQuantity(expectedQuantity);
        return;
      }

      expect(request.body).to.deep.equal({
        product_id: 1,
        quantity: expectedQuantity,
      });
    });
  };

  const mockCurrentUser = () => {
    cy.intercept("GET", "**/api/users/2", {
      statusCode: 200,
      body: user,
    }).as("getCurrentUser");
  };

  const mockCartPage = (cart = cartWithItems) => {
    const state = JSON.parse(JSON.stringify(cart));

    cy.intercept("GET", "**/api/cart", {
      statusCode: 200,
      body: state,
    }).as("getCart");

    cy.intercept("PUT", "**/api/cart/update", (req) => {
      const target = state.items.find((item) => Number(item.product_id) === Number(req.body.product_id));
      if (target) {
        target.quantity = Number(req.body.quantity);
      }
      req.reply({
        statusCode: 200,
        body: state,
      });
    }).as("updateCart");

    cy.intercept("DELETE", "**/api/cart/remove", (req) => {
      state.items = state.items.filter((item) => Number(item.product_id) !== Number(req.body.product_id));
      req.reply({
        statusCode: 200,
        body: state,
      });
    }).as("removeCart");

    return state;
  };

  const visitCartAsUser = (cart = cartWithItems) => {
    cy.mockCatalog();
    mockCurrentUser();
    mockCartPage(cart);

    cy.visit("/cart", {
      onBeforeLoad(window) {
        window.localStorage.setItem("token", "mock-user-token");
        window.localStorage.setItem("user", JSON.stringify(user));
      },
    });

    cy.wait("@getCurrentUser");
    cy.wait("@getCart");
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV0: Khách chưa đăng nhập truy cập giỏ hàng sẽ bị chuyển hướng đến trang đăng nhập", () => {
    cy.mockCatalog();
    cy.visit("/cart");

    cy.url().should("eq", `${Cypress.config("baseUrl")}/login`);
    cy.contains('button[type="submit"]', "Đăng nhập").should("be.visible");
  });

  it("DV1: Trạng thái giỏ hàng trống được hiển thị chính xác", () => {
    visitCartAsUser(emptyCart);

    cy.contains("h1", "Giỏ hàng của bạn đang trống.").should("be.visible");
    cy.contains("a", "Tiếp tục mua sắm").should("be.visible");
  });

  it("DV2: Trang giỏ hàng hiển thị các sản phẩm trong giỏ và phần tổng kết", () => {
    visitCartAsUser();

    cy.contains("h1", "Giỏ hàng của bạn").should("be.visible");
    cy.contains("Radiance Glow Serum").should("exist");
    cy.contains("Velvet Matte Lipstick").should("exist");
    expectSummaryTotal(797000);
  });

  it("API1: Giỏ hàng được tải tự động khi người dùng đã đăng nhập mở trang", () => {
    visitCartAsUser();

    cy.url().should("eq", cartUrl);
    expectSummarySelectedCount(3, 3);
  });

  it("API2: Tăng số lượng sẽ gửi yêu cầu cập nhật và làm mới thành tiền của dòng sản phẩm", () => {
    visitCartAsUser();

    cy.contains("Radiance Glow Serum")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.contains("button", "+").click();
      });

    cy.wait("@updateCart").its("request.body").should("deep.equal", {
      product_id: 1,
      quantity: 3,
    });

    cy.contains("Radiance Glow Serum")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.get('input[type="number"]').should("have.value", "3");
      });
    expectCartItemTotal("Radiance Glow Serum", 299000 * 3);
  });

  it("API3: Giảm số lượng sẽ cập nhật sản phẩm nhưng không bao giờ nhỏ hơn 1", () => {
    visitCartAsUser();

    cy.contains("Velvet Matte Lipstick")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.contains("button", "-").click();
      });

    cy.wait("@updateCart").its("request.body").should("deep.equal", {
      product_id: 2,
      quantity: 1,
    });

    cy.contains("Velvet Matte Lipstick")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.get('input[type="number"]').should("have.value", "1");
      });
  });

  it("API4: Nhập tay số lượng sẽ được chuẩn hóa về giá trị tối thiểu là 1", () => {
    visitCartAsUser();

    cy.contains("Radiance Glow Serum")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.get('input[type="number"]').focus().type("{selectall}0");
      });

    cy.wait("@updateCart").its("request.body").should("deep.equal", {
      product_id: 1,
      quantity: 1,
    });
  });

  it("API4B: Nhập số lượng lớn vẫn được chấp nhận và phản ánh đúng sau khi tải lại", () => {
    visitCartAsUser();

    cy.contains("Radiance Glow Serum")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.get('input[type="number"]').focus().type("{selectall}15");
      });

    waitForCartUpdateQuantity(15);

    cy.reload();
    cy.wait("@getCurrentUser");
    cy.wait("@getCart");

    cy.contains("Radiance Glow Serum")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.get('input[type="number"]').should("have.value", "15");
      });
    expectCartItemTotal("Radiance Glow Serum", 299000 * 15);
  });

  it("API5: Xóa sản phẩm sẽ gửi yêu cầu xóa và cập nhật giao diện giỏ hàng", () => {
    visitCartAsUser();

    cy.contains("Velvet Matte Lipstick")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.contains("button", "Xóa").click();
      });

    cy.wait("@removeCart").its("request.body").should("deep.equal", {
      product_id: 2,
    });

    cy.contains("Velvet Matte Lipstick").should("not.exist");
    expectSummarySelectedCount(2, 2);
  });

  it("API6: Checkbox chọn tất cả vẫn đồng bộ sau khi xóa một sản phẩm đã chọn", () => {
    visitCartAsUser();

    cy.contains("span", "Chọn tất cả sản phẩm")
      .closest("label")
      .find('input[type="checkbox"]')
      .should("be.checked");

    cy.contains("Velvet Matte Lipstick")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.contains("button", "Xóa").click();
      });

    cy.wait("@removeCart");

    cy.contains("span", "Chọn tất cả sản phẩm")
      .closest("label")
      .find('input[type="checkbox"]')
      .should("be.checked");
    expectSummarySelectedCount(2, 2);
  });

  it("VAL1: Bỏ chọn toàn bộ sản phẩm sẽ vô hiệu nút thanh toán", () => {
    visitCartAsUser();

    cy.contains("span", "Chọn tất cả sản phẩm")
      .closest("label")
      .find('input[type="checkbox"]')
      .click();

    cy.contains("button", "Thanh toán sản phẩm đã chọn").should("be.disabled");
    expectSummarySelectedCount(0, 3);
  });

  it("VAL2: Chọn một sản phẩm sẽ cập nhật phần tổng kết chính xác", () => {
    visitCartAsUser();

    cy.contains("Velvet Matte Lipstick")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.get('input[type="checkbox"]').uncheck({ force: true });
      });

    expectSummarySelectedCount(2, 3);
    expectSummaryTotal(299000 * 2);
  });

  it("NEG1: Xóa sản phẩm cuối cùng sẽ hiển thị trạng thái giỏ hàng trống", () => {
    visitCartAsUser({
      id: 1,
      user_id: 2,
      items: [
        {
          id: 1,
          product_id: 1,
          quantity: 1,
          product: {
            id: 1,
            name: "Radiance Glow Serum",
            price: 299000,
            image: "https://images.example.com/serum.jpg",
            category: { name: "Serum" },
          },
        },
      ],
      totalPrice: 299000,
    });

    cy.contains("Radiance Glow Serum")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.contains("button", "Xóa").click();
      });

    cy.wait("@removeCart");
    cy.contains("h1", "Giỏ hàng của bạn đang trống.").should("be.visible");
  });

  it("E2E1: Thanh toán các sản phẩm đã chọn sẽ lưu id sản phẩm và chuyển hướng đến checkout", () => {
    visitCartAsUser();

    cy.contains("Velvet Matte Lipstick")
      .closest(".fashion-cart-item")
      .within(() => {
        cy.get('input[type="checkbox"]').uncheck({ force: true });
      });

    cy.contains("button", "Thanh toán sản phẩm đã chọn").click();
    cy.url().should("eq", checkoutUrl);

    cy.window().then((window) => {
      expect(JSON.parse(window.sessionStorage.getItem("dolia_checkout_product_ids"))).to.deep.equal([1]);
    });
  });
});
