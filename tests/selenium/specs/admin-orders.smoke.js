const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-orders",
  description: "Kiểm tra nhanh danh sách đơn hàng admin và mở chi tiết đơn",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/orders`);
    await waitForUrlContains(driver, "/admin/orders", config.timeoutMs);
    await waitForLocated(driver, By.css(".dashboard-table"), config.timeoutMs);

    const rows = await driver.findElements(By.css(".dashboard-table tbody tr"));
    if (!rows.length) {
      throw new Error("Không tìm thấy dòng đơn hàng nào trong bảng admin orders.");
    }

    const firstOrderCode = await driver.findElement(By.css(".dashboard-table tbody tr:first-child td:first-child")).getText();
    await driver.findElement(By.xpath("//table[contains(@class,'dashboard-table')]//button[contains(., 'Xem')]")).click();
    await waitForLocated(driver, By.css(".order-admin-drawer"), config.timeoutMs);
    await waitForLocated(driver, By.css(".order-admin-panel"), config.timeoutMs);
    await waitForLocated(driver, By.css(".order-admin-summary"), config.timeoutMs);

    const orderCode = await driver.findElement(By.css(".order-admin-head h2")).getText();
    if (orderCode !== firstOrderCode) {
      throw new Error(`Mã đơn ở drawer (${orderCode}) không khớp dòng đã chọn (${firstOrderCode}).`);
    }
    console.log(`[admin-orders] Mở chi tiết đơn hàng thành công: ${orderCode}`);
  },
};
