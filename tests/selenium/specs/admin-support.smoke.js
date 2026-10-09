const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-support",
  description: "Kiểm tra nhanh trung tâm hỗ trợ admin và chuyển tab hướng dẫn",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/support`);
    await waitForUrlContains(driver, "/admin/support", config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-support-page"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-support-guides"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-support-stats"), config.timeoutMs);

    const guideButtons = await driver.findElements(By.css(".admin-support-guides nav button"));
    if (guideButtons.length > 1) {
      await guideButtons[1].click();
    }

    const heading = await driver.findElement(By.css(".admin-support-heading h1")).getText();
    console.log(`[admin-support] Mở trang thành công: ${heading}`);
  },
};
