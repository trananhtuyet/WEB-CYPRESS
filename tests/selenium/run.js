const config = require("./config");
const { createDriver, setDesktopViewport } = require("./utils/driver");
const loginSmoke = require("./specs/login.smoke");
const registerLoginSmoke = require("./specs/register-login.smoke");
const searchSmoke = require("./specs/search.smoke");
const favoritesSmoke = require("./specs/favorites.smoke");
const cartSmoke = require("./specs/cart.smoke");
const checkoutSmoke = require("./specs/checkout.smoke");
const ordersSmoke = require("./specs/orders.smoke");
const accountSmoke = require("./specs/account.smoke");
const contactSmoke = require("./specs/contact.smoke");
const homeCommentSmoke = require("./specs/home-comment.smoke");
const productCommentSmoke = require("./specs/product-comment.smoke");
const reviewSmoke = require("./specs/review.smoke");
const styleChatSmoke = require("./specs/style-chat.smoke");
const adminLoginSmoke = require("./specs/admin-login.smoke");
const adminDashboardSmoke = require("./specs/admin-dashboard.smoke");
const adminOrdersSmoke = require("./specs/admin-orders.smoke");
const adminVouchersSmoke = require("./specs/admin-vouchers.smoke");
const adminOverviewSmoke = require("./specs/admin-overview.smoke");
const adminUsersSmoke = require("./specs/admin-users.smoke");
const adminContactsSmoke = require("./specs/admin-contacts.smoke");
const adminReportsSmoke = require("./specs/admin-reports.smoke");
const adminPaymentsSmoke = require("./specs/admin-payments.smoke");
const adminSettingsSmoke = require("./specs/admin-settings.smoke");
const adminSupportSmoke = require("./specs/admin-support.smoke");

const availableSpecs = {
  [loginSmoke.name]: loginSmoke,
  [registerLoginSmoke.name]: registerLoginSmoke,
  [searchSmoke.name]: searchSmoke,
  [favoritesSmoke.name]: favoritesSmoke,
  [cartSmoke.name]: cartSmoke,
  [checkoutSmoke.name]: checkoutSmoke,
  [ordersSmoke.name]: ordersSmoke,
  [accountSmoke.name]: accountSmoke,
  [contactSmoke.name]: contactSmoke,
  [homeCommentSmoke.name]: homeCommentSmoke,
  [productCommentSmoke.name]: productCommentSmoke,
  [reviewSmoke.name]: reviewSmoke,
  [styleChatSmoke.name]: styleChatSmoke,
  [adminLoginSmoke.name]: adminLoginSmoke,
  [adminDashboardSmoke.name]: adminDashboardSmoke,
  [adminOrdersSmoke.name]: adminOrdersSmoke,
  [adminVouchersSmoke.name]: adminVouchersSmoke,
  [adminOverviewSmoke.name]: adminOverviewSmoke,
  [adminUsersSmoke.name]: adminUsersSmoke,
  [adminContactsSmoke.name]: adminContactsSmoke,
  [adminReportsSmoke.name]: adminReportsSmoke,
  [adminPaymentsSmoke.name]: adminPaymentsSmoke,
  [adminSettingsSmoke.name]: adminSettingsSmoke,
  [adminSupportSmoke.name]: adminSupportSmoke,
};

function resolveRequestedSpecs() {
  const fromCli = process.argv.slice(2);
  const fromEnv = process.env.SELENIUM_SPECS
    ? process.env.SELENIUM_SPECS.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const requested = fromCli.length ? fromCli : fromEnv;
  if (!requested.length || requested.includes("all")) {
    return Object.values(availableSpecs);
  }

  const unknown = requested.filter((name) => !availableSpecs[name]);
  if (unknown.length) {
    throw new Error(
      `Không tìm thấy Selenium spec: ${unknown.join(", ")}. Các spec hợp lệ: ${Object.keys(availableSpecs).join(", ")}`
    );
  }

  return requested.map((name) => availableSpecs[name]);
}

async function run() {
  const specs = resolveRequestedSpecs();
  const driver = await createDriver(config.browserName);

  try {
    await setDesktopViewport(driver);

    for (const spec of specs) {
      console.log(`\n=== Selenium spec: ${spec.name} ===`);
      console.log(spec.description);
      await spec.run(driver, config);
      console.log(`=== Hoàn tất: ${spec.name} ===`);
    }
  } finally {
    await driver.quit();
  }
}

run().catch((error) => {
  console.error("Selenium run thất bại.");
  console.error(error);
  process.exitCode = 1;
});
