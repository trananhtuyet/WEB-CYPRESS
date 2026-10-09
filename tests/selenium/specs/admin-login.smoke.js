const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-login",
  description: "Kiểm tra nhanh luồng đăng nhập admin và hiển thị shell quản trị",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await waitForUrlContains(driver, "/admin", config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-shell"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-sidebar"), config.timeoutMs);
    await waitForLocated(driver, By.css(".admin-nav"), config.timeoutMs);
    const navItems = await driver.findElements(By.css(".admin-nav a"));
    if (navItems.length < 8) {
      throw new Error(`Menu admin hiển thị quá ít mục: ${navItems.length}`);
    }

    const currentUrl = await driver.getCurrentUrl();
    console.log(`[admin-login] Đăng nhập admin thành công: ${currentUrl}`);
  },
};
