const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { addFirstRealProductToCart, loginAsUser } = require("../utils/app");

module.exports = {
  name: "cart",
  description: "Kiểm tra nhanh giỏ hàng: thêm sản phẩm, tăng số lượng, giảm số lượng và xóa sản phẩm",
  async run(driver, config) {
    await loginAsUser(driver, config);
    await addFirstRealProductToCart(driver, config);

    await driver.findElement(By.css('a[aria-label="Giỏ hàng"]')).click();
    await waitForUrlContains(driver, "/cart", config.timeoutMs);
    await waitForLocated(driver, By.css(".fashion-cart-page"), config.timeoutMs);

    const firstCartItem = await waitForLocated(driver, By.css(".fashion-cart-item"), config.timeoutMs);
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", firstCartItem);

    const quantityInput = await driver.findElement(By.css(".fashion-cart-item .fashion-cart-qty input"));
    const quantityBefore = Number(await quantityInput.getAttribute("value"));
    await driver.findElement(By.css(".fashion-cart-item .fashion-cart-qty button:last-child")).click();

    await driver.wait(async () => {
      const value = Number(await quantityInput.getAttribute("value"));
      return value >= quantityBefore + 1;
    }, config.timeoutMs);

    const quantityAfterIncrease = Number(await quantityInput.getAttribute("value"));
    console.log(`[cart] Tăng số lượng thành công từ ${quantityBefore} lên ${quantityAfterIncrease}`);

    await driver.findElement(By.css(".fashion-cart-item .fashion-cart-qty button:first-child")).click();
    await driver.wait(async () => {
      const value = Number(await quantityInput.getAttribute("value"));
      return value === quantityBefore;
    }, config.timeoutMs);

    const quantityAfterDecrease = Number(await quantityInput.getAttribute("value"));
    console.log(`[cart] Giảm số lượng thành công từ ${quantityAfterIncrease} xuống ${quantityAfterDecrease}`);

    await driver.findElement(By.css(".fashion-cart-item .fashion-cart-remove")).click();
    await driver.wait(async () => {
      const items = await driver.findElements(By.css(".fashion-cart-item"));
      return items.length === 0;
    }, config.timeoutMs);

    await waitForLocated(driver, By.css(".fashion-cart-empty, .fashion-cart-page"), config.timeoutMs);
    console.log("[cart] Xóa sản phẩm khỏi giỏ hàng thành công.");
  },
};
