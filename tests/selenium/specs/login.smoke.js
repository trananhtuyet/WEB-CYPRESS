const { By, Key, until, error } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { buildFreshUser, clearBrowserState, logoutIfNeeded, registerFreshUser } = require("../utils/app");

async function readToastMessage(driver) {
  const toasts = await driver.findElements(By.css(".toast"));
  if (!toasts.length) return "";

  const messages = await Promise.all(toasts.map((toast) => toast.getText()));
  return messages.filter(Boolean).join(" | ");
}

async function waitForLoginResult(driver, loginUrl, timeoutMs) {
  return driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl !== loginUrl) {
      return { status: "redirected", currentUrl };
    }

    const toastMessage = await readToastMessage(driver);
    if (toastMessage) {
      return { status: "toast", currentUrl, toastMessage };
    }

    return false;
  }, timeoutMs);
}

async function waitForToastsToDisappear(driver, timeoutMs) {
  await driver.wait(async () => {
    const toasts = await driver.findElements(By.css(".toast"));
    if (!toasts.length) return true;

    const states = await Promise.all(
      toasts.map(async (toast) => {
        try {
          return await toast.isDisplayed();
        } catch {
          return false;
        }
      })
    );

    return states.every((isDisplayed) => !isDisplayed);
  }, timeoutMs);
}

async function clickWhenReady(driver, locator, timeoutMs) {
  const element = await driver.findElement(locator);
  await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", element);

  try {
    await driver.wait(until.elementIsVisible(element), Math.min(timeoutMs, 5000));
    await element.click();
  } catch (err) {
    if (!(err instanceof error.ElementClickInterceptedError)) {
      throw err;
    }

    await driver.executeScript("arguments[0].click();", element);
  }
}

module.exports = {
  name: "login",
  description: "Kiểm tra nhanh luồng đăng nhập người dùng bằng Selenium",
  async run(driver, config) {
    const user = buildFreshUser(config);
    const loginUrl = `${config.baseUrl}/login`;
    await driver.get(config.baseUrl);
    await clearBrowserState(driver);
    await registerFreshUser(driver, config, user);
    await logoutIfNeeded(driver, config);

    await clearBrowserState(driver);
    await driver.get(loginUrl);

    await waitForLocated(driver, By.id("email"), config.timeoutMs);
    await waitForLocated(driver, By.id("password"), config.timeoutMs);

    const emailInput = await driver.findElement(By.id("email"));
    const passwordInput = await driver.findElement(By.id("password"));

    await emailInput.clear();
    await emailInput.sendKeys(user.email);

    await passwordInput.clear();
    await passwordInput.sendKeys(user.password);

    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    const loginResult = await waitForLoginResult(driver, loginUrl, config.timeoutMs);
    if (loginResult.status === "toast") {
      throw new Error(
        `Đăng nhập không thành công. URL hiện tại: ${loginResult.currentUrl}. Toast: ${loginResult.toastMessage}`
      );
    }

    await driver.wait(until.elementLocated(By.css('button[aria-label="Đăng xuất"]')), config.timeoutMs);

    const currentUrl = await driver.getCurrentUrl();
    console.log(`[login] Đăng nhập thành công với ${user.email}: ${currentUrl}`);

    try {
      await waitForToastsToDisappear(driver, 5000);
    } catch {
      // Toast can linger in the DOM longer than its visual overlay.
    }

    await clickWhenReady(driver, By.css('button[aria-label="Đăng xuất"]'), config.timeoutMs);
    await waitForUrlContains(driver, "/login", config.timeoutMs);

    console.log("[login] Đăng xuất thành công.");
  },
};
