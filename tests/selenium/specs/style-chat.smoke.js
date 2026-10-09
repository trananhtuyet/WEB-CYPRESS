const { By, Key } = require("selenium-webdriver");
const { waitForLocated, waitForUrlContains } = require("../utils/driver");

async function waitForChatAnswer(driver, initialAssistantCount, timeoutMs) {
  return driver.wait(async () => {
    const messages = await driver.findElements(By.css(".style-chat-messages article.assistant p"));
    if (messages.length <= initialAssistantCount) return false;

    const answer = await messages[messages.length - 1].getText();
    if (!answer || answer.includes("Đang nghĩ outfit hợp gu cho bạn")) return false;

    return answer;
  }, timeoutMs);
}

module.exports = {
  name: "style-chat",
  description: "Kiểm tra nhanh widget AI phối đồ và ô tìm kiếm bằng Selenium",
  async run(driver, config) {
    await driver.get(config.baseUrl);

    await waitForLocated(driver, By.css(".fashion-search input"), config.timeoutMs);

    const chatToggle = await driver.findElement(By.css(".style-chat-toggle"));
    await chatToggle.click();

    await waitForLocated(driver, By.css(".style-chat-panel"), config.timeoutMs);
    const assistantMessages = await driver.findElements(By.css(".style-chat-messages article.assistant"));
    const initialAssistantCount = assistantMessages.length;

    const input = await driver.findElement(By.css(".style-chat-form input"));
    await input.sendKeys(config.chatPrompt, Key.ENTER);

    const answer = await waitForChatAnswer(driver, initialAssistantCount, config.timeoutMs);
    console.log("[style-chat] Phản hồi AI:");
    console.log(answer);

    if (!answer || answer.length < 10) {
      throw new Error("Phản hồi AI quá ngắn hoặc rỗng.");
    }

    const keyword = "Polo";
    const searchInput = await driver.findElement(By.css(".fashion-search input"));
    await searchInput.clear();
    await searchInput.sendKeys(keyword, Key.ENTER);
    await waitForUrlContains(driver, "?search=", config.timeoutMs);

    console.log(`[style-chat] Tìm kiếm hoạt động: ${await driver.getCurrentUrl()}`);
  },
};
