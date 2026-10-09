const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-settings",
  description: "Kiểm tra nhanh trang cài đặt cửa hàng admin",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/settings`);
    await waitForUrlContains(driver, "/admin/settings", config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-settings-page"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-settings-layout"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-settings-submit button[type='submit']"), config.timeoutMs);
    await waitForLocated(driver, By.xpath("//label[contains(., 'Tên cửa hàng')]"), config.timeoutMs);
    await waitForLocated(driver, By.xpath("//label[contains(., 'Miễn phí vận chuyển từ')]"), config.timeoutMs);

    const heading = await driver.findElement(By.css(".admin-settings-heading h1")).getText();
    console.log(`[admin-settings] Mở trang thành công: ${heading}`);
  },
};
