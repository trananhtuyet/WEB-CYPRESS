const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsAdmin } = require("../utils/app");

module.exports = {
  name: "admin-contacts",
  description: "Kiểm tra nhanh trang liên hệ khách hàng của admin và mở chi tiết hội thoại",
  async run(driver, config) {
    await loginAsAdmin(driver, config);
    await driver.get(`${config.baseUrl}/admin/contacts`);
    await waitForUrlContains(driver, "/admin/contacts", config.timeoutMs);
    await waitForLocated(driver, By.css(".contact-admin-page"), config.timeoutMs);
    await waitForLocated(driver, By.css(".contact-admin-layout"), config.timeoutMs);

    const messageButtons = await driver.findElements(By.css(".contact-admin-list button"));
    if (messageButtons.length) {
      await messageButtons[0].click();
      await waitForLocated(driver, By.css(".contact-admin-detail"), config.timeoutMs);
      await waitForLocated(driver, By.css(".contact-chat-composer textarea"), config.timeoutMs);
      console.log("[admin-contacts] Mở chi tiết liên hệ thành công.");
      return;
    }

    await waitForLocated(driver, By.css(".contact-admin-empty"), config.timeoutMs);
    console.log("[admin-contacts] Không có dữ liệu liên hệ, trang vẫn hiển thị ổn định.");
  },
};
