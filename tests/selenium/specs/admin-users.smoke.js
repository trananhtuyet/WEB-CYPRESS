const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-users",
  description: "Kiểm tra nhanh trang quản lý khách hàng admin",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/users`);
    await waitForUrlContains(driver, "/admin/users", config.timeoutMs);
    await waitForLocated(driver, By.css(".customer-admin-page"), config.timeoutMs);
    await waitForLocated(driver, By.css(".customer-table"), config.timeoutMs);
    const rows = await driver.findElements(By.css(".customer-table tbody tr"));
    if (!rows.length) {
      throw new Error("Bảng khách hàng admin không có dữ liệu hiển thị.");
    }

    const firstHeader = await driver.findElement(By.css(".customer-admin-heading h1")).getText();
    console.log(`[admin-users] Mở trang thành công: ${firstHeader}`);
  },
};
