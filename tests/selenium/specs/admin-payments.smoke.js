const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-payments",
  description: "Kiểm tra nhanh trang cấu hình QR thanh toán admin",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/payments`);
    await waitForUrlContains(driver, "/admin/payments", config.timeoutMs);
    await waitForLocated(driver, By.css(".payment-admin-page"), config.timeoutMs);
    await waitForLocated(driver, By.css(".payment-admin-panel"), config.timeoutMs);
    await waitForLocated(driver, By.css(".payment-admin-preview img"), config.timeoutMs);
    await waitForLocated(driver, By.css('input[placeholder="Nhập số tài khoản nhận tiền"]'), config.timeoutMs);

    const accountName = await driver.findElement(By.css('input[placeholder="Tên chủ tài khoản"]')).getAttribute("value");
    console.log(`[admin-payments] Cấu hình thanh toán hiển thị: ${accountName}`);
  },
};
