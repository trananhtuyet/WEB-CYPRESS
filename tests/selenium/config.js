const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");

function getTimeout(name, fallback) {
  const value = Number(process.env[name] || fallback);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

module.exports = {
  rootDir,
  baseUrl: process.env.SELENIUM_BASE_URL || "http://localhost:5173",
  browserName: process.env.SELENIUM_BROWSER || "chrome",
  timeoutMs: getTimeout("SELENIUM_TIMEOUT_MS", 30000),
  chatPrompt: process.env.SELENIUM_CHAT_PROMPT || "Phối đồ đi học cho nam",
  registerName: process.env.SELENIUM_REGISTER_NAME || "Selenium User",
  registerPhone: process.env.SELENIUM_REGISTER_PHONE || "0901234567",
  registerPassword: process.env.SELENIUM_REGISTER_PASSWORD || "Password@123",
  registerEmailPrefix: process.env.SELENIUM_REGISTER_EMAIL_PREFIX || "selenium.user",
  loginUserEmail: process.env.SELENIUM_USER_EMAIL || "user@cosmetics.local",
  loginUserPassword: process.env.SELENIUM_USER_PASSWORD || "User@123",
  loginAdminEmail: process.env.SELENIUM_ADMIN_EMAIL || "admin@cosmetics.local",
  loginAdminPassword: process.env.SELENIUM_ADMIN_PASSWORD || "Admin@123",
};
