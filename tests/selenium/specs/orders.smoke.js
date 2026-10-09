const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { extractFirstNumber, loginAsUser } = require("../utils/app");

module.exports = {
  name: "orders",
  description: "Kiểm tra nhanh trang đơn hàng và bộ lọc trạng thái",
  async run(driver, config) {
    await loginAsUser(driver, config);
    await driver.get(`${config.baseUrl}/orders`);
    await waitForUrlContains(driver, "/orders", config.timeoutMs);
    await waitForLocated(driver, By.css(".fashion-orders-page"), config.timeoutMs);
    const orderSummaryCount = extractFirstNumber(await driver.findElement(By.css(".fashion-orders-hero aside strong")).getText());

    const orderCards = await driver.findElements(By.css(".fashion-order-card"));
    if (!orderCards.length) {
      await waitForLocated(driver, By.css(".fashion-orders-empty"), config.timeoutMs);
      console.log("[orders] Trang đơn hàng đang ở trạng thái trống.");
      return;
    }

    if (orderSummaryCount < orderCards.length) {
      throw new Error(`Tổng số đơn hiển thị ở header (${orderSummaryCount}) nhỏ hơn số card thực tế (${orderCards.length}).`);
    }

    await driver.findElement(By.xpath("//div[contains(@class,'fashion-orders-tabs')]//button[contains(., 'Đang giao')]")).click();
    await driver.wait(async () => {
      const buttons = await driver.findElements(By.css(".fashion-orders-tabs button.active"));
      if (!buttons.length) return false;
      return (await buttons[0].getText()).includes("Đang giao");
    }, config.timeoutMs);

    const activeTab = await driver.findElement(By.css(".fashion-orders-tabs button.active")).getText();
    if (!activeTab.includes("Đang giao")) {
      throw new Error(`Tab lọc không chuyển đúng. Active hiện tại: ${activeTab}`);
    }

    console.log(`[orders] Trang đơn hàng hiển thị ${orderCards.length} đơn và lọc trạng thái hoạt động.`);
  },
};
