const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-overview",
  description: "Kiểm tra nhanh trang tổng quan kinh doanh của admin",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/overview`);
    await waitForUrlContains(driver, "/admin/overview", config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-overview"), config.timeoutMs);
    await waitForLocated(driver, By.css(".overview-kpi-grid"), config.timeoutMs);
    await waitForLocated(driver, By.css(".overview-grid"), config.timeoutMs);
    const kpiCards = await driver.findElements(By.css(".overview-kpi-grid article"));
    if (kpiCards.length < 4) {
      throw new Error(`Trang overview đang thiếu KPI card. Hiện có: ${kpiCards.length}`);
    }

    const heading = await driver.findElement(By.css(".admin-overview-heading h1")).getText();
    console.log(`[admin-overview] Mở trang thành công: ${heading}`);
  },
};
