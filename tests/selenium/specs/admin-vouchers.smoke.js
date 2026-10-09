const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-vouchers",
  description: "Kiểm tra nhanh danh sách voucher admin và mở form tạo voucher",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/vouchers`);
    await waitForUrlContains(driver, "/admin/vouchers", config.timeoutMs);
    await waitForLocated(driver, By.css(".voucher-admin-page"), config.timeoutMs);
    await waitForLocated(driver, By.css(".product-admin-table"), config.timeoutMs);

    await driver.findElement(By.xpath("//button[contains(., 'Thêm Voucher')]")).click();
    await waitForLocated(driver, By.css(".product-admin-drawer"), config.timeoutMs);
    await waitForLocated(driver, By.css(".product-admin-form"), config.timeoutMs);
    await waitForLocated(driver, By.xpath("//label[contains(., 'Mã voucher')]"), config.timeoutMs);
    await waitForLocated(driver, By.xpath("//label[contains(., 'Tên voucher')]"), config.timeoutMs);
    await waitForLocated(driver, By.xpath("//label[contains(., 'Loại giảm')]"), config.timeoutMs);

    const title = await driver.findElement(By.css(".product-admin-form-head h2")).getText();
    console.log(`[admin-vouchers] Mở form voucher thành công: ${title}`);
  },
};
