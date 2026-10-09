const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { extractFirstNumber, safeType, waitForTextContains, waitForToastContains } = require("../utils/app");

module.exports = {
  name: "contact",
  description: "Kiểm tra nhanh biểu mẫu liên hệ với vai trò khách",
  async run(driver, config) {
    await driver.get(`${config.baseUrl}/contact`);
    await waitForUrlContains(driver, "/contact", config.timeoutMs);
    await waitForLocated(driver, By.css(".fashion-contact-page"), config.timeoutMs);

    const stamp = Date.now();
    const threadCountBefore = extractFirstNumber(
      await driver.findElement(By.css(".fashion-contact-replies-head span")).getText()
    );
    const messageText = `Tin nhan selenium ${stamp}`;
    await safeType(driver, By.css('input[name="name"]'), "Guest Selenium", config.timeoutMs);
    await safeType(driver, By.css('input[name="phone"]'), "0900000000", config.timeoutMs);
    await safeType(driver, By.css('input[name="email"]'), `guest.${stamp}@example.com`, config.timeoutMs);
    await driver.findElement(By.css('select[name="topic"]')).sendKeys("Tư vấn sản phẩm");
    await safeType(driver, By.css('textarea[name="message"]'), messageText, config.timeoutMs);

    await driver.findElement(By.xpath("//button[contains(., 'Gửi liên hệ')]")).click();
    await waitForToastContains(driver, "Đã gửi liên hệ", config.timeoutMs);
    await waitForTextContains(driver, By.css(".fashion-contact-thread p, .fashion-contact-bubble p"), messageText, config.timeoutMs);

    const threadCountAfter = extractFirstNumber(
      await driver.findElement(By.css(".fashion-contact-replies-head span")).getText()
    );
    if (threadCountAfter < threadCountBefore) {
      throw new Error("Số cuộc trò chuyện sau khi gửi liên hệ bị giảm bất thường.");
    }

    console.log(`[contact] Gửi liên hệ thành công. Threads ${threadCountBefore} -> ${threadCountAfter}`);
  },
};
