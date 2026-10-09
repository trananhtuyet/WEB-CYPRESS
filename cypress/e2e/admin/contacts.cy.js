const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Quản lý liên hệ admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trang liên hệ admin hiển thị thống kê, tabs và chi tiết hội thoại", () => {
    mockAdminWorkspace("/admin/contacts");

    cy.wait("@getAdminContacts");

    cy.contains("h1", "Liên hệ khách hàng").should("be.visible");
    cy.contains(".contact-admin-stats", "Tổng liên hệ").should("contain.text", "2");
    cy.contains(".contact-admin-tabs button", "Tất cả").should("exist");
    cy.contains(".contact-admin-list button", "Alice Nguyen").should("exist");
    cy.contains(".contact-admin-detail", "Chủ đề: Hỗ trợ đơn hàng").should("exist");
  });

  it("DV2: Tab trạng thái lọc đúng danh sách liên hệ", () => {
    mockAdminWorkspace("/admin/contacts");

    cy.wait("@getAdminContacts");

    cy.contains(".contact-admin-tabs button", "Mới").click();
    cy.contains(".contact-admin-list button", "Alice Nguyen").should("exist");
    cy.contains(".contact-admin-list button", "Minh Tran").should("not.exist");

    cy.contains(".contact-admin-tabs button", "Đã trả lời").click();
    cy.contains(".contact-admin-list button", "Minh Tran").should("exist");
    cy.contains(".contact-admin-list button", "Alice Nguyen").should("not.exist");
  });

  it("API1: Admin có thể phản hồi yêu cầu liên hệ và cập nhật trạng thái sang đã trả lời", () => {
    mockAdminWorkspace("/admin/contacts");

    cy.wait("@getAdminContacts");

    cy.contains(".contact-admin-list button", "Alice Nguyen").click();
    cy.get('.contact-chat-composer textarea').type("Dolia đã cập nhật thời gian giao hàng cho bạn.");
    cy.contains(".contact-chat-composer button", "Gửi").click();

    cy.wait("@addAdminReply").its("request.body").should("deep.equal", {
      text: "Dolia đã cập nhật thời gian giao hàng cho bạn.",
    });
    cy.contains(".toast", "Đã lưu phản hồi khách hàng").should("exist");
    cy.contains(".contact-chat-row.admin", "Dolia đã cập nhật thời gian giao hàng cho bạn.").should("exist");
    cy.contains(".contact-admin-status", "Đã trả lời").should("exist");
  });

  it("API2: Admin có thể đóng trực tiếp một yêu cầu liên hệ", () => {
    mockAdminWorkspace("/admin/contacts");

    cy.wait("@getAdminContacts");

    cy.contains(".contact-chat-composer button", "Đóng yêu cầu").click();

    cy.wait("@updateContactStatus").its("request.body").should("deep.equal", {
      status: "closed",
    });
    cy.contains(".toast", "Đã đóng yêu cầu liên hệ").should("exist");
    cy.contains(".contact-admin-detail .contact-admin-status", "Đã đóng").should("exist");
  });

  it("VAL1: Admin không thể gửi phản hồi rỗng", () => {
    mockAdminWorkspace("/admin/contacts");

    cy.wait("@getAdminContacts");

    cy.contains(".contact-chat-composer button", "Gửi").click();
    cy.contains(".toast", "Vui lòng nhập nội dung phản hồi").should("exist");
  });

  it("VAL2: Sau khi gửi phản hồi thành công, ô nhập phản hồi được làm trống", () => {
    mockAdminWorkspace("/admin/contacts");

    cy.wait("@getAdminContacts");

    cy.get('.contact-chat-composer textarea').type("Phản hồi đã được gửi.");
    cy.contains(".contact-chat-composer button", "Gửi").click();
    cy.wait("@addAdminReply");
    cy.get('.contact-chat-composer textarea').should("have.value", "");
  });

  it("NEG1: Admin contact fallback về local storage khi API tải danh sách lỗi", () => {
    mockAdminWorkspace("/admin/contacts", {
      getAdminContactsStatusCode: 500,
      getAdminContactsBody: { message: "Cannot load contacts" },
      onBeforeLoad(window) {
        window.localStorage.setItem("dolia_contact_messages", JSON.stringify([
          {
            id: 9001,
            name: "Local Guest",
            phone: "0999888777",
            email: "local@example.com",
            topic: "Thanh toán",
            message: "Mình cần kiểm tra giao dịch local fallback.",
            status: "new",
            createdAt: Date.parse("2026-05-18T10:00:00.000Z"),
            customerReplies: [],
            replies: [],
          },
        ]));
      },
    });

    cy.contains(".contact-admin-list button", "Local Guest").should("exist");
    cy.contains(".contact-admin-detail", "Mình cần kiểm tra giao dịch local fallback.").should("exist");
  });

  it("NEG2: Gửi phản hồi thất bại hiển thị lỗi và giữ nguyên nội dung nhập", () => {
    mockAdminWorkspace("/admin/contacts", {
      addAdminReplyStatusCode: 500,
      addAdminReplyErrorBody: { message: "Reply failed" },
    });

    cy.wait("@getAdminContacts");

    cy.get('.contact-chat-composer textarea').type("Nội dung lỗi.");
    cy.contains(".contact-chat-composer button", "Gửi").click();

    cy.wait("@addAdminReply");
    cy.contains(".toast", "Reply failed").should("exist");
    cy.get('.contact-chat-composer textarea').should("have.value", "Nội dung lỗi.");
  });

  it("E2E1: Admin có thể phản hồi rồi đóng yêu cầu liên hệ trong cùng phiên", () => {
    mockAdminWorkspace("/admin/contacts");

    cy.wait("@getAdminContacts");

    cy.contains(".contact-admin-list button", "Alice Nguyen").click();
    cy.get('.contact-chat-composer textarea').type("Dolia đã cập nhật thời gian giao hàng cho bạn.");
    cy.contains(".contact-chat-composer button", "Gửi").click();
    cy.wait("@addAdminReply");

    cy.contains(".contact-chat-composer button", "Đóng yêu cầu").click();
    cy.wait("@updateContactStatus").its("request.body").should("deep.equal", {
      status: "closed",
    });
    cy.contains(".toast", "Đã đóng yêu cầu liên hệ").should("exist");
    cy.contains(".contact-admin-detail .contact-admin-status", "Đã đóng").should("exist");
  });

  it("E2E2: Admin fallback local có thể phản hồi rồi đóng liên hệ và dữ liệu vẫn hiển thị", () => {
    mockAdminWorkspace("/admin/contacts", {
      getAdminContactsStatusCode: 500,
      getAdminContactsBody: { message: "Cannot load contacts" },
      onBeforeLoad(window) {
        window.localStorage.setItem("dolia_contact_messages", JSON.stringify([
          {
            id: 9001,
            name: "Local Guest",
            phone: "0999888777",
            email: "local@example.com",
            topic: "Thanh toán",
            message: "Mình cần kiểm tra giao dịch local fallback.",
            status: "new",
            createdAt: Date.parse("2026-05-18T10:00:00.000Z"),
            customerReplies: [],
            replies: [],
          },
        ]));
      },
    });

    cy.get('.contact-chat-composer textarea').type("Shop đã kiểm tra local fallback.");
    cy.contains(".contact-chat-composer button", "Gửi").click();
    cy.contains(".contact-chat-row.admin", "Shop đã kiểm tra local fallback.").should("exist");

    cy.contains(".contact-chat-composer button", "Đóng yêu cầu").click();
    cy.contains(".contact-admin-detail .contact-admin-status", "Đã đóng").should("exist");
    cy.contains(".contact-admin-list button", "Local Guest").should("exist");
  });
});
