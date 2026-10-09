const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-dashboard",
  description: "Kiểm tra nhanh dashboard admin và điều hướng từ quick action",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await waitForUrlContains(driver, "/admin", config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-home"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-home-hero"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-home-action-card"), config.timeoutMs);
    const quickActions = await driver.findElements(By.css(".admin-home-action-card"));
    if (quickActions.length < 4) {
      throw new Error(`Dashboard admin đang thiếu quick action. Hiện có: ${quickActions.length}`);
    }

    const revenueCard = await driver.findElement(By.css(".admin-home-revenue-card strong")).getText();
    console.log(`[admin-dashboard] Doanh thu hiện tại: ${revenueCard}`);

    await driver.findElement(By.xpath("//a[contains(@class,'admin-home-action-card')][.//strong[contains(., 'Quản Lý Đơn Hàng')]]")).click();
    await waitForUrlContains(driver, "/admin/orders", config.timeoutMs);
    await waitForLocated(driver, By.css(".dashboard-table"), config.timeoutMs);
    await waitForLocated(driver, By.xpath("//h1[contains(., 'Bảng Điều Khiển & Quản Lý')]"), config.timeoutMs);
    console.log(`[admin-dashboard] Điều hướng sang quản lý đơn hàng thành công: ${await driver.getCurrentUrl()}`);
  },
};
