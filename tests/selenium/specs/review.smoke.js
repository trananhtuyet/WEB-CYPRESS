const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { extractFirstNumber } = require("../utils/app");

module.exports = {
  name: "review",
  description: "Kiểm tra nhanh luồng nhập và gửi đánh giá sản phẩm",
  async run(driver, config) {
    await driver.get(config.baseUrl);

    const productLinkSelector = '.fashion-product-grid .fashion-product-card .fashion-product-copy a[href*="/products/"]';
    await waitForLocated(driver, By.css(productLinkSelector), config.timeoutMs);
    await driver.findElement(By.css(productLinkSelector)).click();
    await waitForUrlContains(driver, "/products/", config.timeoutMs);

    await waitForLocated(driver, By.css(".fashion-detail-page"), config.timeoutMs);
    await waitForLocated(driver, By.id("product-review-text"), config.timeoutMs);
    await waitForLocated(driver, By.id("product-review-form"), config.timeoutMs);
    await waitForLocated(driver, By.id("product-review-count"), config.timeoutMs);

    const reviewText = `selenium-review-${Date.now()}`;
    const countBefore = await driver.findElement(By.id("product-review-count")).getText();

    const textarea = await waitForLocated(driver, By.id("product-review-text"), config.timeoutMs);
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", textarea);
    await textarea.clear();
    await textarea.sendKeys(reviewText);
    await driver.findElement(By.id("product-review-submit")).click();

    await driver.wait(async () => {
      const text = await driver.findElement(By.css(".fashion-review-list article p")).getText();
      return text.includes(reviewText);
    }, config.timeoutMs);

    const countAfter = await driver.findElement(By.id("product-review-count")).getText();
    const countBeforeNumber = extractFirstNumber(countBefore);
    const countAfterNumber = extractFirstNumber(countAfter);
    if (countAfterNumber !== countBeforeNumber + 1) {
      throw new Error(`Bộ đếm review không tăng đúng. Trước: ${countBefore}, Sau: ${countAfter}`);
    }

    console.log(`[review] Trước khi gửi: ${countBefore}`);
    console.log(`[review] Sau khi gửi: ${countAfter}`);
    console.log(`[review] Nội dung mới nhất: ${await driver.findElement(By.css(".fashion-review-list article p")).getText()}`);
  },
};
