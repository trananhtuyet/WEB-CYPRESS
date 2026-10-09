const { By } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");
const { loginAsUser } = require("../utils/app");

module.exports = {
  name: "account",
  description: "Kiểm tra nhanh trang tài khoản và thao tác vào chế độ chỉnh sửa rồi hủy",
  async run(driver, config) {
    await loginAsUser(driver, config);
    await driver.get(`${config.baseUrl}/account`);
    await waitForUrlContains(driver, "/account", config.timeoutMs);
    await waitForLocated(driver, By.css(".fashion-account-page"), config.timeoutMs);

    await waitForLocated(driver, By.xpath("//h1[contains(., 'Tài khoản cá nhân')]"), config.timeoutMs);
    const profileNameBefore = await driver.findElement(By.css(".fashion-account-info-view article strong")).getText();
    await driver.findElement(By.xpath("//button[contains(., 'Sửa thông tin')]")).click();
    await waitForLocated(driver, By.css(".fashion-account-edit-form"), config.timeoutMs);
    const editNameValue = await driver.findElement(By.css('.fashion-account-fields input[name="name"]')).getAttribute("value");
    if (!editNameValue.trim()) {
      throw new Error("Form chỉnh sửa tài khoản mở ra nhưng trường họ tên bị trống.");
    }
    await driver.findElement(By.xpath("//button[contains(., 'Hủy')]")).click();

    await driver.wait(async () => {
      const forms = await driver.findElements(By.css(".fashion-account-edit-form"));
      return !forms.length;
    }, config.timeoutMs);

    const profileNameAfter = await driver.findElement(By.css(".fashion-account-info-view article strong")).getText();
    if (profileNameBefore !== profileNameAfter) {
      throw new Error("Dữ liệu hiển thị sau khi hủy chỉnh sửa không khớp với ban đầu.");
    }

    console.log("[account] Trang tài khoản mở được, form có dữ liệu và hủy chỉnh sửa giữ nguyên thông tin.");
  },
};
