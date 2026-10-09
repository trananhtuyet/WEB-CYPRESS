describe("Dolia Shop - Hộp chat AI stylist", () => {
  const assistantAnswer =
    "Nếu đi hẹn hò, bạn có thể chọn áo sơ mi sáng màu phối cùng quần tối màu và giày sạch, gọn.";

  const mockChatPage = ({
    responseStatusCode = 200,
    responseBody = { answer: assistantAnswer },
  } = {}) => {
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
            limit: 12,
            totalItems: catalog.products.length,
            totalPages: 1,
          },
        },
      }).as("getProducts");

      cy.intercept("POST", "**/api/style-chat", {
        statusCode: responseStatusCode,
        body: responseBody,
      }).as("askStyleAssistant");

      cy.visit("/");
    });
  };

  it("DV1: Có thể mở chatbox và hiển thị lời chào AI ban đầu", () => {
    mockChatPage();

    cy.contains(".style-chat-toggle", "AI phối đồ").click();

    cy.get('.style-chat-panel[aria-label="Stylist AI"]').should("be.visible");
    cy.contains(".style-chat-panel strong", "Tư vấn phối đồ").should("exist");
    cy.contains(
      ".style-chat-messages article.assistant",
      "Chào bạn, mình là stylist AI của Dolia."
    ).should("exist");
  });

  it("DV2: Chatbox hiển thị các gợi ý nhanh và biểu mẫu nhập liệu", () => {
    mockChatPage();

    cy.contains(".style-chat-toggle", "AI phối đồ").click();

    cy.contains(".style-chat-suggestions button", "Phong cách nào đang hot?").should("exist");
    cy.contains(".style-chat-suggestions button", "Phối đồ đi học cho nam").should("exist");
    cy.contains(".style-chat-suggestions button", "Đi hẹn hò mặc gì?").should("exist");
    cy.get(".style-chat-form input").should("have.attr", "placeholder", "Hỏi cách phối đồ, màu sắc, trend...");
  });

  it("API1: Người dùng có thể gửi tin nhắn đã nhập và nhận phản hồi từ AI", () => {
    mockChatPage();

    cy.contains(".style-chat-toggle", "AI phối đồ").click();
    cy.get(".style-chat-form input").type("Đi hẹn hò mặc gì?");
    cy.contains('.style-chat-form button[type="submit"]', "Gửi").click();

    cy.wait("@askStyleAssistant").its("request.body").should((body) => {
      expect(body.message).to.equal("Đi hẹn hò mặc gì?");
      expect(body.history).to.be.an("array");
      expect(body.history[0].role).to.equal("assistant");
    });

    cy.contains(".style-chat-messages article.user", "Đi hẹn hò mặc gì?").should("exist");
    cy.contains(".style-chat-messages article.assistant", assistantAnswer).should("exist");
  });

  it("API2: Bấm vào một gợi ý sẽ gửi trực tiếp cho trợ lý", () => {
    mockChatPage();

    cy.contains(".style-chat-toggle", "AI phối đồ").click();
    cy.contains(".style-chat-suggestions button", "Phối đồ đi học cho nam").click();

    cy.wait("@askStyleAssistant").its("request.body.message").should("eq", "Phối đồ đi học cho nam");
    cy.contains(".style-chat-messages article.user", "Phối đồ đi học cho nam").should("exist");
  });

  it("VAL1: Nút gửi vẫn bị vô hiệu khi ô nhập tin nhắn trống", () => {
    mockChatPage();

    cy.contains(".style-chat-toggle", "AI phối đồ").click();

    cy.contains('.style-chat-form button[type="submit"]', "Gửi").should("be.disabled");
    cy.get(".style-chat-form input").type("   ");
    cy.contains('.style-chat-form button[type="submit"]', "Gửi").should("be.disabled");
  });

  it("VAL2: Trạng thái đang tải xuất hiện khi trợ lý đang tạo phản hồi", () => {
    mockChatPage();

    cy.intercept("POST", "**/api/style-chat", (req) => {
      req.reply((res) => {
        res.delay = 500;
        res.send({
          statusCode: 200,
          body: { answer: assistantAnswer },
        });
      });
    }).as("slowStyleAssistant");

    cy.contains(".style-chat-toggle", "AI phối đồ").click();
    cy.get(".style-chat-form input").type("Phối đồ tối giản cho nam");
    cy.contains('.style-chat-form button[type="submit"]', "Gửi").click();

    cy.contains(".style-chat-messages article.assistant", "Đang nghĩ outfit hợp gu cho bạn...").should("exist");
    cy.contains(".style-chat-suggestions button", "Phong cách nào đang hot?").should("be.disabled");
    cy.wait("@slowStyleAssistant");
  });

  it("NEG1: Backend lỗi sẽ hiển thị thông báo lỗi fallback của trợ lý", () => {
    mockChatPage({
      responseStatusCode: 500,
      responseBody: { message: "AI service unavailable" },
    });

    cy.contains(".style-chat-toggle", "AI phối đồ").click();
    cy.get(".style-chat-form input").type("Phối đồ cho buổi họp");
    cy.contains('.style-chat-form button[type="submit"]', "Gửi").click();

    cy.wait("@askStyleAssistant");
    cy.contains(".style-chat-messages article.assistant", "AI service unavailable").should("exist");
  });

  it("E2E1: Người dùng có thể mở, trò chuyện, đóng và mở lại chatbox mà vẫn giữ nguyên hội thoại", () => {
    mockChatPage();

    cy.contains(".style-chat-toggle", "AI phối đồ").click();
    cy.get(".style-chat-form input").type("Đi chơi cuối tuần mặc gì?");
    cy.contains('.style-chat-form button[type="submit"]', "Gửi").click();

    cy.wait("@askStyleAssistant");
    cy.contains(".style-chat-panel button[aria-label='Đóng chat']", "×").click();
    cy.get(".style-chat-panel").should("not.exist");

    cy.contains(".style-chat-toggle", "AI phối đồ").click();
    cy.contains(".style-chat-messages article.user", "Đi chơi cuối tuần mặc gì?").should("exist");
    cy.contains(".style-chat-messages article.assistant", assistantAnswer).should("exist");
  });
});
