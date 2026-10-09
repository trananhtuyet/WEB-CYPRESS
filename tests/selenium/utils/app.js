const { By, until, Key } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("./driver");

function buildFreshUser(config) {
  const stamp = Date.now();
  return {
    name: config.registerName,
    phone: config.registerPhone,
    email: `${config.registerEmailPrefix}.${stamp}@example.com`,
    password: config.registerPassword,
  };
}

async function clearBrowserState(driver) {
  await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
}

async function readToastMessages(driver) {
  const toasts = await driver.findElements(By.css(".toast"));
  if (!toasts.length) return [];

  const texts = await Promise.all(
    toasts.map(async (toast) => {
      try {
        return await toast.getText();
      } catch {
        return "";
      }
    })
  );

  return texts.filter(Boolean);
}

async function waitForToastContains(driver, expectedText, timeoutMs) {
  await driver.wait(async () => {
    const messages = await readToastMessages(driver);
    return messages.some((message) => message.includes(expectedText));
  }, timeoutMs);
}

async function waitForTextContains(driver, locator, expectedText, timeoutMs) {
  return driver.wait(async () => {
    const elements = await driver.findElements(locator);
    if (!elements.length) return false;

    for (const element of elements) {
      try {
        const text = await element.getText();
        if (text.includes(expectedText)) {
          return text;
        }
      } catch {
        // Ignore detached/hidden elements while polling.
      }
    }

    return false;
  }, timeoutMs);
}

function extractFirstNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

async function waitForLoginOutcome(driver, loginUrl, timeoutMs) {
  return driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl !== loginUrl) {
      return { status: "redirected", currentUrl };
    }

    const messages = await readToastMessages(driver);
    if (messages.length) {
      return { status: "toast", currentUrl, messages };
    }

    return false;
  }, timeoutMs);
}

async function logoutIfNeeded(driver, config) {
  const logoutButtons = await driver.findElements(By.css('button[aria-label="Đăng xuất"]'));
  if (!logoutButtons.length) return false;

  await logoutButtons[0].click();
  await waitForUrlContains(driver, "/login", config.timeoutMs);
  return true;
}

async function registerFreshUser(driver, config, user = buildFreshUser(config)) {
  const registerUrl = `${config.baseUrl}/register`;

  await driver.get(registerUrl);
  await waitForLocated(driver, By.id("name"), config.timeoutMs);
  await waitForLocated(driver, By.id("password"), config.timeoutMs);

  await driver.findElement(By.id("name")).sendKeys(user.name);
  await driver.findElement(By.id("phone")).sendKeys(user.phone);
  await driver.findElement(By.id("email")).sendKeys(user.email);
  await driver.findElement(By.id("password")).sendKeys(user.password);
  await driver.findElement(By.css('button[type="submit"]')).click();

  await driver.wait(async () => (await driver.getCurrentUrl()) !== registerUrl, config.timeoutMs);
  await driver.wait(until.elementLocated(By.css('button[aria-label="Đăng xuất"]')), config.timeoutMs);
  return user;
}

async function loginAsUser(driver, config) {
  const loginUrl = `${config.baseUrl}/login`;

  await driver.get(config.baseUrl);
  await clearBrowserState(driver);
  await driver.get(loginUrl);

  const emailInput = await waitForLocated(driver, By.id("email"), config.timeoutMs);
  const passwordInput = await waitForLocated(driver, By.id("password"), config.timeoutMs);

  await emailInput.clear();
  await emailInput.sendKeys(config.loginUserEmail);
  await passwordInput.clear();
  await passwordInput.sendKeys(config.loginUserPassword);
  await driver.findElement(By.id("login-submit")).click();

  const outcome = await waitForLoginOutcome(driver, loginUrl, config.timeoutMs);
  if (outcome.status === "toast") {
    const invalidCredentials = outcome.messages.some((message) => message.includes("Invalid email or password"));
    if (!invalidCredentials) {
      throw new Error(
        `Đăng nhập user thất bại. URL hiện tại: ${outcome.currentUrl}. Toast: ${outcome.messages.join(" | ")}`
      );
    }

    await clearBrowserState(driver);
    return registerFreshUser(driver, config);
  }

  await driver.wait(until.elementLocated(By.css('button[aria-label="Đăng xuất"]')), config.timeoutMs);
  return {
    email: config.loginUserEmail,
    password: config.loginUserPassword,
  };
}

async function loginAsAdmin(driver, config) {
  const loginUrl = `${config.baseUrl}/login`;

  await driver.get(config.baseUrl);
  await clearBrowserState(driver);
  await driver.get(loginUrl);

  const emailInput = await waitForLocated(driver, By.id("email"), config.timeoutMs);
  const passwordInput = await waitForLocated(driver, By.id("password"), config.timeoutMs);

  await emailInput.clear();
  await emailInput.sendKeys(config.loginAdminEmail);
  await passwordInput.clear();
  await passwordInput.sendKeys(config.loginAdminPassword);
  await driver.findElement(By.id("login-submit")).click();

  const outcome = await waitForLoginOutcome(driver, loginUrl, config.timeoutMs);
  if (outcome.status === "toast") {
    throw new Error(
      `Đăng nhập admin thất bại. URL hiện tại: ${outcome.currentUrl}. Toast: ${outcome.messages.join(" | ")}`
    );
  }

  await driver.wait(until.elementLocated(By.css('.admin-shell, .admin-home, .admin-main')), config.timeoutMs);
  return {
    email: config.loginAdminEmail,
    password: config.loginAdminPassword,
  };
}

async function openFirstRealProduct(driver, config) {
  const selector = '.fashion-product-grid .fashion-product-card .fashion-product-copy a[href*="/products/"]';
  await driver.get(config.baseUrl);
  await waitForLocated(driver, By.css(selector), config.timeoutMs);
  await driver.findElement(By.css(selector)).click();
  await waitForUrlContains(driver, "/products/", config.timeoutMs);
}

async function addFirstRealProductToCart(driver, config) {
  await driver.get(config.baseUrl);
  const productCardSelector = ".fashion-product-grid .fashion-product-card";
  const addButtonSelector = ".fashion-product-grid .fashion-product-card .fashion-product-action";

  await waitForLocated(driver, By.css(productCardSelector), config.timeoutMs);
  const firstButton = await driver.findElement(By.css(addButtonSelector));
  await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", firstButton);
  await firstButton.click();
  await waitForToastContains(driver, "Đã thêm vào giỏ hàng", config.timeoutMs);
}

async function safeType(driver, locator, value, timeoutMs) {
  const element = await waitForLocated(driver, locator, timeoutMs);
  await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", element);
  await element.clear();
  await element.sendKeys(value);
  return element;
}

async function submitWithEnter(driver, locator, value, timeoutMs) {
  const element = await safeType(driver, locator, value, timeoutMs);
  await element.sendKeys(Key.ENTER);
}

module.exports = {
  addFirstRealProductToCart,
  buildFreshUser,
  clearBrowserState,
  loginAsAdmin,
  loginAsUser,
  logoutIfNeeded,
  openFirstRealProduct,
  readToastMessages,
  registerFreshUser,
  safeType,
  submitWithEnter,
  waitForTextContains,
  waitForToastContains,
  extractFirstNumber,
};
