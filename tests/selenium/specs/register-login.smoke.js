const { By, until } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");

async function readToastMessage(driver) {
  const toasts = await driver.findElements(By.css(".toast"));
  if (!toasts.length) return "";

  const messages = await Promise.all(toasts.map((toast) => toast.getText()));
  return messages.filter(Boolean).join(" | ");
}

function buildFreshUser(config) {
  const stamp = Date.now();
  return {
    name: config.registerName,
    phone: config.registerPhone,
    email: `${config.registerEmailPrefix}.${stamp}@example.com`,
    password: config.registerPassword,
  };
}

async function fillRegisterForm(driver, user) {
  await driver.findElement(By.id("name")).sendKeys(user.name);
  await driver.findElement(By.id("phone")).sendKeys(user.phone);
  await driver.findElement(By.id("email")).sendKeys(user.email);
  await driver.findElement(By.id("password")).sendKeys(user.password);
}

async function assertLoggedIn(driver, timeoutMs) {
  await driver.wait(until.elementLocated(By.css('button[aria-label="Đăng xuất"]')), timeoutMs);
  await driver.wait(until.elementLocated(By.css('a[aria-label="Tài khoản"]')), timeoutMs);
}

module.exports = {
  name: "register-login",
  description: "Đăng ký tài khoản mới hợp lệ rồi đăng nhập lại bằng chính tài khoản đó",
  async run(driver, config) {
    const user = buildFreshUser(config);
    const registerUrl = `${config.baseUrl}/register`;
    const loginUrl = `${config.baseUrl}/login`;

    await driver.get(config.baseUrl);
    await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");

    await driver.get(registerUrl);
    await waitForLocated(driver, By.id("name"), config.timeoutMs);
    await waitForLocated(driver, By.id("password"), config.timeoutMs);

    await fillRegisterForm(driver, user);
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(async () => (await driver.getCurrentUrl()) !== registerUrl, config.timeoutMs);
    await assertLoggedIn(driver, config.timeoutMs);
    const accountLabelAfterRegister = await driver.findElement(By.css('a[aria-label="Tài khoản"] strong')).getText();
    if (!accountLabelAfterRegister.includes(user.name)) {
      throw new Error(`Sau đăng ký, tên hiển thị không khớp. Mong đợi chứa "${user.name}", nhận được "${accountLabelAfterRegister}"`);
    }

    const registerToast = await readToastMessage(driver);
    console.log(`[register-login] Đăng ký thành công với email: ${user.email}`);
    if (registerToast) {
      console.log(`[register-login] Toast sau đăng ký: ${registerToast}`);
    }

    await driver.findElement(By.css('button[aria-label="Đăng xuất"]')).click();
    await waitForUrlContains(driver, "/login", config.timeoutMs);

    await waitForLocated(driver, By.id("email"), config.timeoutMs);
    await driver.findElement(By.id("email")).sendKeys(user.email);
    await driver.findElement(By.id("password")).sendKeys(user.password);
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(async () => (await driver.getCurrentUrl()) !== loginUrl, config.timeoutMs);
    await assertLoggedIn(driver, config.timeoutMs);
    const accountLabelAfterLogin = await driver.findElement(By.css('a[aria-label="Tài khoản"] strong')).getText();
    if (!accountLabelAfterLogin.includes(user.name)) {
      throw new Error(`Sau đăng nhập lại, tên hiển thị không khớp. Mong đợi chứa "${user.name}", nhận được "${accountLabelAfterLogin}"`);
    }

    const currentUrl = await driver.getCurrentUrl();
    const loginToast = await readToastMessage(driver);
    console.log(`[register-login] Đăng nhập lại thành công: ${currentUrl}`);
    if (loginToast) {
      console.log(`[register-login] Toast sau đăng nhập: ${loginToast}`);
    }
  },
};
