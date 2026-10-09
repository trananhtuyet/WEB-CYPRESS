const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { extractFirstNumber } = require("../utils/app");

module.exports = {
  name: "favorites",
  description: "Kiểm tra nhanh luồng thêm sản phẩm vào yêu thích và mở trang yêu thích",
  async run(driver, config) {
    await driver.get(config.baseUrl);

    const favoriteBadge = By.css('a[aria-label="Sản phẩm yêu thích"] span');
    const firstProductCard = By.css(".fashion-product-grid .fashion-product-card");
    const firstProductName = By.css(".fashion-product-grid .fashion-product-card .fashion-product-copy a");
    const firstWishlistButton = By.css(".fashion-product-grid .fashion-product-card .fashion-wishlist-button");

    await waitForLocated(driver, favoriteBadge, config.timeoutMs);
    await waitForLocated(driver, firstProductCard, config.timeoutMs);

    const favoriteCountBefore = extractFirstNumber(await driver.findElement(favoriteBadge).getText());
    const productName = await driver.findElement(firstProductName).getText();
    await driver.findElement(firstWishlistButton).click();

    await driver.wait(async () => {
      const button = await driver.findElement(firstWishlistButton);
      return (await button.getAttribute("aria-pressed")) === "true";
    }, config.timeoutMs);

    await driver.wait(async () => {
      const badge = await driver.findElement(favoriteBadge);
      return extractFirstNumber(await badge.getText()) === favoriteCountBefore + 1;
    }, config.timeoutMs);

    await driver.findElement(By.css('a[aria-label="Sản phẩm yêu thích"]')).click();
    await waitForUrlContains(driver, "/favorites", config.timeoutMs);
    await waitForLocated(driver, By.css(".fashion-favorites-page"), config.timeoutMs);

    await driver.wait(async () => {
      const names = await driver.findElements(By.css(".fashion-favorites-page .fashion-product-card div a"));
      const texts = await Promise.all(names.map((element) => element.getText()));
      return texts.includes(productName);
    }, config.timeoutMs);

    const favoriteCountAfter = extractFirstNumber(await driver.findElement(favoriteBadge).getText());
    console.log(`[favorites] Yêu thích hoạt động với sản phẩm: ${productName}. Badge ${favoriteCountBefore} -> ${favoriteCountAfter}`);
  },
};
