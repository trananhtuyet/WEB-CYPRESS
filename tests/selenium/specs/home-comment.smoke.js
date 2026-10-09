const { By, until } = require("selenium-webdriver");
const { waitForLocated } = require("../utils/driver");
const { extractFirstNumber } = require("../utils/app");

module.exports = {
  name: "home-comment",
  description: "Kiểm tra nhanh luồng gửi bình luận ở Trang chủ",
  async run(driver, config) {
    await driver.get(config.baseUrl);

    await waitForLocated(driver, By.id("home-comment-form"), config.timeoutMs);

    const commentForm = await driver.findElement(By.id("home-comment-form"));
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", commentForm);

    const commentText = `selenium-home-comment-${Date.now()}`;
    const countBefore = await driver.findElement(By.id("home-comment-count")).getText();

    const textarea = await waitForLocated(driver, By.id("home-comment-text"), config.timeoutMs);
    await driver.wait(until.elementIsVisible(textarea), config.timeoutMs);
    await textarea.clear();
    await textarea.sendKeys(commentText);

    await driver.findElement(By.id("home-comment-submit")).click();

    await driver.wait(async () => {
      const latestComment = await driver.findElement(By.css(".fashion-comment-list article p")).getText();
      return latestComment.includes(commentText);
    }, config.timeoutMs);

    const countAfter = await driver.findElement(By.id("home-comment-count")).getText();
    const countBeforeNumber = extractFirstNumber(countBefore);
    const countAfterNumber = extractFirstNumber(countAfter);
    if (countAfterNumber !== countBeforeNumber + 1) {
      throw new Error(`Bộ đếm bình luận không tăng đúng. Trước: ${countBefore}, Sau: ${countAfter}`);
    }

    console.log(`[home-comment] Trước khi gửi: ${countBefore}`);
    console.log(`[home-comment] Sau khi gửi: ${countAfter}`);
    console.log(
      `[home-comment] Nội dung mới nhất: ${await driver.findElement(By.css(".fashion-comment-list article p")).getText()}`
    );
  },
};
