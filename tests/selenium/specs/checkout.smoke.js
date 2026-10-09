const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { addFirstRealProductToCart, extractFirstNumber, loginAsUser, readToastMessages } = require("../utils/app");

module.exports = {
  name: "checkout",
  description: "Kiểm tra nhanh checkout COD từ giỏ hàng đến trang đơn hàng",
  async run(driver, config) {
    await loginAsUser(driver, config);
    await addFirstRealProductToCart(driver, config);

    await driver.get(`${config.baseUrl}/cart`);
    await waitForLocated(driver, By.css(".fashion-cart-page"), config.timeoutMs);
    const selectedTotalBeforeCheckout = await driver.findElement(By.css(".fashion-cart-summary h2")).getText();
    await driver.findElement(By.xpath("//button[contains(., 'Thanh toán sản phẩm đã chọn')]")).click();
    await waitForUrlContains(driver, "/checkout", config.timeoutMs);

    await waitForLocated(driver, By.css(".fashion-checkout-page"), config.timeoutMs);

    const useAccountCheckbox = await driver.findElement(By.css(".fashion-account-toggle input[type='checkbox']"));
    const checked = await useAccountCheckbox.isSelected();
    if (!checked) {
      await useAccountCheckbox.click();
    }

    const checkoutInputs = await driver.findElements(By.css(".fashion-checkout-fields input"));
    if (checkoutInputs.length < 2) {
      throw new Error("Khong tim thay du input tren form checkout.");
    }

    const receiverInput = checkoutInputs[0];
    const phoneInput = checkoutInputs[1];
    const addressInputs = await driver.findElements(By.css(".google-address-picker input, .google-address-picker textarea"));

    const receiverValue = await receiverInput.getAttribute("value");
    if (!String(receiverValue || "").trim()) {
      await receiverInput.clear();
      await receiverInput.sendKeys("Selenium Checkout User");
    }

    const phoneValue = await phoneInput.getAttribute("value");
    if (!String(phoneValue || "").trim()) {
      await phoneInput.clear();
      await phoneInput.sendKeys("0901234567");
    }

    if (addressInputs.length) {
      const addressInput = addressInputs[addressInputs.length - 1];
      const addressValue = await addressInput.getAttribute("value");
      if (!String(addressValue || "").trim()) {
        await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", addressInput);
        await addressInput.clear();
        await addressInput.sendKeys("48 Nguyen Trai, Quan 1, TP Ho Chi Minh");
      }
    }

    await driver.findElement(By.xpath("//label[.//strong[contains(., 'Thanh toán khi nhận hàng')]]")).click();
    await driver.findElement(By.css(".fashion-checkout-summary button[type='submit']")).click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      if (url.includes("/orders")) return true;

      const toasts = await readToastMessages(driver);
      return toasts.length > 0;
    }, config.timeoutMs);

    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes("/checkout")) {
      const toasts = await readToastMessages(driver);
      throw new Error(`Checkout chưa hoàn tất. URL hiện tại: ${currentUrl}. Toast: ${toasts.join(" | ") || "không có"}`);
    }

    await waitForUrlContains(driver, "/orders", config.timeoutMs);
    await waitForLocated(driver, By.css(".fashion-orders-page"), config.timeoutMs);
    const ordersCount = extractFirstNumber(await driver.findElement(By.css(".fashion-orders-hero aside strong")).getText());
    if (ordersCount < 1) {
      throw new Error("Checkout thành công nhưng trang đơn hàng không ghi nhận đơn nào.");
    }

    const firstOrderTotal = await driver.findElement(By.css(".fashion-order-card header strong")).getText();
    console.log(`[checkout] Giá trị ở giỏ trước checkout: ${selectedTotalBeforeCheckout}`);
    console.log(`[checkout] Đơn đầu tiên sau checkout: ${firstOrderTotal}`);
    console.log(`[checkout] Checkout COD thành công: ${await driver.getCurrentUrl()}`);
  },
};
