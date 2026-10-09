const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-reports",
  description: "Kiểm tra nhanh trang báo cáo admin và thao tác lọc thời gian",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/reports`);
    await waitForUrlContains(driver, "/admin/reports", config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-report-page"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-report-kpis"), config.timeoutMs);

    const modeSelect = await driver.findElement(By.css(".admin-report-actions select"));
    await modeSelect.sendKeys("Theo tháng");
    await waitForLocated(driver, By.css(".admin-report-filter-card"), config.timeoutMs);
    await waitForLocated(driver, By.css('input[type="month"], select'), config.timeoutMs);

    const heading = await driver.findElement(By.css(".admin-report-heading h1")).getText();
    console.log(`[admin-reports] Mở trang thành công: ${heading}`);
  },
};
