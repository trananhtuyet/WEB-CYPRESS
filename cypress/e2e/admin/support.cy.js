const { mockAdminWorkspace } = require("./adminTestUtils");

describe("Dolia Shop - Trung tâm hỗ trợ admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("DV1: Trung tâm hỗ trợ hiển thị trạng thái API, checklist và yêu cầu gần đây", () => {
    mockAdminWorkspace("/admin/support");

    cy.wait("@getAdminContacts");
    cy.wait("@getHealth");

    cy.contains("h1", "Hỗ trợ vận hành").should("be.visible");
    cy.contains(".admin-support-stats article", "Trạng thái API").should("contain.text", "Online");
    cy.contains(".admin-support-stats article", "Tổng yêu cầu").should("contain.text", "2");
    cy.contains(".admin-support-checklist", "Backend đang chạy ở cổng 5000").should("exist");
    cy.contains(".admin-support-tickets article", "Alice Nguyen").should("exist");
  });

  it("DV2: Khi không có yêu cầu nào, support center hiển thị empty state an toàn", () => {
    mockAdminWorkspace("/admin/support", {
      getAdminContactsBody: [],
    });

    cy.wait("@getAdminContacts");
    cy.wait("@getHealth");

    cy.contains(".admin-support-stats article", "Tổng yêu cầu").should("contain.text", "0");
    cy.contains(".admin-support-empty", "Chưa có yêu cầu hỗ trợ nào từ khách hàng.").should("exist");
  });

  it("API1: Chuyển guide trong support center cập nhật đúng nội dung hướng dẫn", () => {
    mockAdminWorkspace("/admin/support");

    cy.wait("@getAdminContacts");
    cy.wait("@getHealth");

    cy.contains(".admin-support-guides nav button", "Báo cáo doanh thu").click();
    cy.contains(".admin-support-guides article h3", "Báo cáo doanh thu").should("be.visible");
    cy.contains(".admin-support-guides article p", "Trang báo cáo tổng hợp đơn hàng").should("exist");
  });

  it("API2: Thống kê support phản ánh đúng số yêu cầu mới, đã phản hồi và đã đóng", () => {
    mockAdminWorkspace("/admin/support", {
      getAdminContactsBody: [
        { id: 1, name: "A", topic: "Đơn hàng", message: "new", status: "new", replies: [] },
        { id: 2, name: "B", topic: "Đổi trả", message: "replied", status: "replied", replies: [] },
        { id: 3, name: "C", topic: "Khác", message: "closed", status: "closed", replies: [] },
      ],
    });

    cy.wait("@getAdminContacts");
    cy.wait("@getHealth");

    cy.contains(".admin-support-stats article", "Tổng yêu cầu").should("contain.text", "3");
    cy.contains(".admin-support-stats article", "Tổng yêu cầu").should("contain.text", "1 yêu cầu mới");
    cy.contains(".admin-support-stats article", "Đã phản hồi").should("contain.text", "1");
    cy.contains(".admin-support-stats article", "Đã phản hồi").should("contain.text", "1 yêu cầu đã đóng");
  });

  it("VAL1: Checklist demo cho phép bật tắt checkbox theo thao tác của admin", () => {
    mockAdminWorkspace("/admin/support");

    cy.get('.admin-support-checklist input[type="checkbox"]').eq(2).check({ force: true }).should("be.checked");
    cy.get('.admin-support-checklist input[type="checkbox"]').eq(3).check({ force: true }).should("be.checked");
  });

  it("VAL2: Hướng dẫn mặc định của support center là mục thanh toán ví mô phỏng", () => {
    mockAdminWorkspace("/admin/support");

    cy.contains(".admin-support-guides article h3", "Thanh toán ví mô phỏng").should("be.visible");
    cy.contains(".admin-support-guides article p", "mở màn hình ví demo").should("exist");
  });

  it("NEG1: Support center hiển thị Offline khi health API lỗi và fallback contact local", () => {
    mockAdminWorkspace("/admin/support", {
      getAdminContactsStatusCode: 500,
      getAdminContactsBody: { message: "Cannot load contacts" },
      healthStatusCode: 500,
      healthBody: { message: "Offline" },
      onBeforeLoad(window) {
        window.localStorage.setItem("dolia_contact_messages", JSON.stringify([
          {
            id: 9002,
            name: "Fallback Guest",
            phone: "0888777666",
            email: "fallback@example.com",
            topic: "Tư vấn sản phẩm",
            message: "Mình cần hỗ trợ local fallback ở support center.",
            status: "new",
            createdAt: Date.parse("2026-05-18T11:00:00.000Z"),
            customerReplies: [],
            replies: [],
          },
        ]));
      },
    });

    cy.wait("@getHealth");
    cy.contains(".admin-support-stats article", "Trạng thái API").should("contain.text", "Offline");
    cy.contains(".admin-support-tickets article", "Fallback Guest").should("exist");
  });

  it("NEG2: Chỉ riêng contact API lỗi vẫn giữ hướng dẫn và health online hoạt động", () => {
    mockAdminWorkspace("/admin/support", {
      getAdminContactsStatusCode: 500,
      getAdminContactsBody: { message: "Cannot load contacts" },
      onBeforeLoad(window) {
        window.localStorage.setItem("dolia_contact_messages", JSON.stringify([]));
      },
    });

    cy.wait("@getAdminContacts");
    cy.wait("@getHealth");
    cy.contains(".admin-support-stats article", "Trạng thái API").should("contain.text", "Online");
    cy.contains(".admin-support-empty", "Chưa có yêu cầu hỗ trợ nào từ khách hàng.").should("exist");
    cy.contains(".admin-support-guides article h3", "Thanh toán ví mô phỏng").should("be.visible");
  });

  it("E2E1: Admin đi từ support center sang trang liên hệ bằng link nhanh", () => {
    mockAdminWorkspace("/admin/support");

    cy.contains("a", "Mở liên hệ khách hàng").click();

    cy.url().should("include", "/admin/contacts");
    cy.wait("@getAdminContacts");
    cy.contains("h1", "Liên hệ khách hàng").should("be.visible");
  });

  it("E2E2: Link Xem tất cả trong danh sách yêu cầu gần đây cũng đưa admin sang contacts", () => {
    mockAdminWorkspace("/admin/support");

    cy.contains(".admin-support-panel-head a", "Xem tất cả").click();

    cy.url().should("include", "/admin/contacts");
    cy.wait("@getAdminContacts");
    cy.contains("h1", "Liên hệ khách hàng").should("be.visible");
  });
});
