Cypress.Commands.add("mockCatalog", () => {
  cy.fixture("catalog.json").then((catalog) => {
    cy.intercept("GET", "**/api/categories", {
      statusCode: 200,
      body: catalog.categories,
    }).as("getCategories");

    cy.intercept("GET", /\/api\/products.*/, {
      statusCode: 200,
      body: {
        products: catalog.products,
        pagination: {
          page: 1,
          limit: 8,
          totalItems: catalog.products.length,
          totalPages: 1,
        },
      },
    }).as("getProducts");

    cy.intercept("GET", "**/api/products/1", {
      statusCode: 200,
      body: catalog.products[0],
    }).as("getProduct");
  });
});

Cypress.Commands.add("mockUserAuth", () => {
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

  cy.intercept("POST", "**/api/auth/register", {
    statusCode: 201,
    body: userResponse,
  }).as("register");

  cy.intercept("POST", "**/api/auth/login", {
    statusCode: 200,
    body: userResponse,
  }).as("login");

  cy.window().then((window) => {
    window.localStorage.clear();
  });
});

Cypress.Commands.add("mockCartFlow", () => {
  const cart = {
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
          price: 29.99,
          image: "https://images.example.com/serum.jpg",
        },
      },
    ],
    totalPrice: 29.99,
  };

  cy.intercept("GET", "**/api/cart", {
    statusCode: 200,
    body: cart,
  }).as("getCart");

  cy.intercept("POST", "**/api/cart/add", {
    statusCode: 200,
    body: cart,
  }).as("addToCart");

  cy.intercept("PUT", "**/api/cart/update", (req) => {
    cart.items[0].quantity = req.body.quantity;
    cart.totalPrice = 29.99 * req.body.quantity;
    req.reply({
      statusCode: 200,
      body: cart,
    });
  }).as("updateCart");

  cy.intercept("DELETE", "**/api/cart/remove", {
    statusCode: 200,
    body: { ...cart, items: [], totalPrice: 0 },
  }).as("removeCart");
});

Cypress.Commands.add("mockOrders", () => {
  const order = {
    id: 10,
    user_id: 2,
    total_price: 29.99,
    status: "pending",
    address: "123 Beauty Street",
    created_at: "2026-04-17T10:00:00.000Z",
    items: [
      {
        id: 1,
        quantity: 1,
        price: 29.99,
        product: {
          id: 1,
          name: "Radiance Glow Serum",
        },
      },
    ],
  };

  cy.intercept("POST", "**/api/orders", {
    statusCode: 201,
    body: order,
  }).as("checkout");

  cy.intercept("GET", "**/api/orders/user", {
    statusCode: 200,
    body: [order],
  }).as("userOrders");
});

Cypress.Commands.add("visitAsAdmin", (path = "/admin") => {
  const adminResponse = {
    user: {
      id: 1,
      name: "Admin",
      email: "admin@cosmetics.local",
      role: "admin",
    },
    token: "mock-admin-token",
  };

  cy.intercept("POST", "**/api/auth/login", {
    statusCode: 200,
    body: adminResponse,
  }).as("adminLogin");

  cy.visit(path, {
    onBeforeLoad(window) {
      window.localStorage.setItem("token", adminResponse.token);
      window.localStorage.setItem("user", JSON.stringify(adminResponse.user));
    },
  });
});
