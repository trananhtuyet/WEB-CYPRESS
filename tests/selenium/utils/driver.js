const { Builder, until } = require("selenium-webdriver");

async function createDriver(browserName) {
  return new Builder().forBrowser(browserName).build();
}

async function setDesktopViewport(driver) {
  await driver.manage().window().setRect({ width: 1440, height: 1000 });
}

async function waitForUrlContains(driver, value, timeoutMs) {
  await driver.wait(async () => (await driver.getCurrentUrl()).includes(value), timeoutMs);
}

async function waitForTitle(driver, value, timeoutMs) {
  await driver.wait(async () => (await driver.getTitle()).includes(value), timeoutMs);
}

async function waitForLocated(driver, by, timeoutMs) {
  return driver.wait(until.elementLocated(by), timeoutMs);
}

module.exports = {
  createDriver,
  setDesktopViewport,
  waitForLocated,
  waitForTitle,
  waitForUrlContains,
};
