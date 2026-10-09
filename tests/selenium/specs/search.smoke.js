const { By, Key } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { waitForTextContains } = require("../utils/app");

module.exports = {
  name: "search",
  description: "Kiểm tra nhanh ô tìm kiếm ở trang chủ và điều hướng theo từ khóa",
  async run(driver, config) {
    const keyword = "Polo";
    await driver.get(config.baseUrl);

    const searchInput = await waitForLocated(driver, By.css(".fashion-search input"), config.timeoutMs);
    await searchInput.clear();
    await searchInput.sendKeys(keyword, Key.ENTER);
    await waitForUrlContains(driver, "search=", config.timeoutMs);

    const currentUrl = await driver.getCurrentUrl();
    console.log(`[search] URL sau tìm kiếm: ${currentUrl}`);

    if (!currentUrl.toLowerCase().includes(`search=${keyword.toLowerCase()}`)) {
      throw new Error(`URL tìm kiếm không đúng. URL hiện tại: ${currentUrl}`);
    }

    const productGrid = await driver.findElements(By.css(".fashion-product-grid .fashion-product-card"));
    if (!productGrid.length) {
      await waitForLocated(driver, By.css(".fashion-empty-state"), config.timeoutMs);
      throw new Error(`Tìm kiếm đã điều hướng nhưng không hiển thị sản phẩm nào cho từ khóa hợp lệ '${keyword}'.`);
    }

    await waitForTextContains(
      driver,
      By.css(".fashion-product-grid .fashion-product-card .fashion-product-copy"),
      keyword,
      config.timeoutMs
    ).catch(() => {});
  },
};
