const crypto = require("crypto");
const { Cart, CartItem, PaymentTransaction, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const orderService = require("./orderService");

const getZaloPayConfig = () => ({
  appId: Number(process.env.ZALOPAY_APP_ID),
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_CREATE_ORDER_URL || "https://sb-openapi.zalopay.vn/v2/create",
  callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
  redirectUrl: process.env.ZALOPAY_REDIRECT_URL || `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-result`,
});

const hmacSha256 = (data, key) => crypto.createHmac("sha256", key).update(data).digest("hex");
const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const safeJsonStringify = (value) => JSON.stringify(value ?? null);

const isSameSignature = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""), "hex");
  const rightBuffer = Buffer.from(String(right || ""), "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const getVietnamDatePrefix = () => {
  const date = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}${value("month")}${value("day")}`;
};

const getSelectedCartItems = async (userId, selectedProductIds = []) => {
  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [{ model: CartItem, as: "items", include: [{ model: Product, as: "product" }] }],
  });

  if (!cart || !cart.items.length) {
    throw new ApiError(400, "Cart is empty");
  }

  const normalizedIds = Array.isArray(selectedProductIds)
    ? selectedProductIds.map((id) => Number(id)).filter(Boolean)
    : [];
  const items = normalizedIds.length
    ? cart.items.filter((item) => normalizedIds.includes(Number(item.product_id)))
    : cart.items;

  if (!items.length) {
    throw new ApiError(400, "No selected cart items to checkout");
  }

  for (const item of items) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
    }
  }

  return items;
};

const createZaloPayOrder = async (user, payload) => {
  const config = getZaloPayConfig();
  const missingConfig = [
    !config.appId ? "ZALOPAY_APP_ID" : "",
    !config.key1 ? "ZALOPAY_KEY1" : "",
    !config.key2 ? "ZALOPAY_KEY2" : "",
    !config.callbackUrl ? "ZALOPAY_CALLBACK_URL" : "",
  ].filter(Boolean);

  if (missingConfig.length) {
    throw new ApiError(500, `Thiếu cấu hình ZaloPay: ${missingConfig.join(", ")}`);
  }

  const items = await getSelectedCartItems(user.id, payload.selectedProductIds);
  const itemsSnapshot = items.map((cartItem) => ({
    product_id: Number(cartItem.product_id),
    name: cartItem.product.name,
    price: Number(cartItem.product.price),
    quantity: Number(cartItem.quantity),
  }));
  const subtotal = itemsSnapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const amount = await orderService.calculateOrderTotal(subtotal, payload.discountCode, { throwOnInvalid: true });
  const appTransId = `${getVietnamDatePrefix()}_${user.id}_${Date.now()}`;
  const item = safeJsonStringify(
    itemsSnapshot.map((snapshotItem) => ({
      itemid: String(snapshotItem.product_id),
      itemname: snapshotItem.name,
      itemprice: snapshotItem.price,
      itemquantity: snapshotItem.quantity,
    }))
  );
  const checkoutPayload = {
    address: payload.address,
    phone: payload.phone,
    paymentMethod: "ZaloPay",
    discountCode: payload.discountCode || "",
  };
  const embedData = safeJsonStringify({
    redirecturl: config.redirectUrl,
    transactionCode: appTransId,
  });
  const appTime = Date.now();
  const order = {
    app_id: config.appId,
    app_user: String(user.id),
    app_trans_id: appTransId,
    app_time: appTime,
    amount,
    item,
    embed_data: embedData,
    description: `Dolia thanh toán đơn ${appTransId}`,
    bank_code: "",
    callback_url: config.callbackUrl,
  };
  const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
  order.mac = hmacSha256(data, config.key1);

  const transaction = await PaymentTransaction.create({
    user_id: user.id,
    gateway: "zalopay",
    transaction_code: appTransId,
    amount,
    status: "pending",
    items_snapshot: safeJsonStringify(itemsSnapshot),
    checkout_payload: safeJsonStringify(checkoutPayload),
  });

  let result;
  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(Object.entries(order).filter(([, value]) => value !== undefined)),
    });
    result = await response.json();
  } catch (error) {
    await transaction.update({
      status: "failed",
      gateway_response: safeJsonStringify({ message: error.message }),
    });
    throw new ApiError(502, "Cannot connect to ZaloPay gateway");
  }

  await transaction.update({
    gateway_token: result.zp_trans_token || null,
    gateway_response: safeJsonStringify(result),
  });

  if (result.return_code !== 1) {
    await transaction.update({ status: "failed" });
    throw new ApiError(400, result.return_message || result.sub_return_message || "Cannot create ZaloPay order");
  }

  return {
    appTransId,
    amount,
    orderUrl: result.order_url,
    zpTransToken: result.zp_trans_token,
    qrCode: result.qr_code,
  };
};

const buildPendingTransaction = async (user, payload, gateway) => {
  const items = await getSelectedCartItems(user.id, payload.selectedProductIds);
  const itemsSnapshot = items.map((cartItem) => ({
    product_id: Number(cartItem.product_id),
    name: cartItem.product.name,
    price: Number(cartItem.product.price),
    quantity: Number(cartItem.quantity),
  }));
  const subtotal = itemsSnapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const amount = await orderService.calculateOrderTotal(subtotal, payload.discountCode, { throwOnInvalid: true });
  const transactionCode = `${gateway}_${user.id}_${Date.now()}`;
  const checkoutPayload = {
    address: payload.address,
    phone: payload.phone,
    paymentMethod: gateway === "mockwallet" ? "Ví điện tử mô phỏng" : gateway,
    discountCode: payload.discountCode || "",
  };

  const transaction = await PaymentTransaction.create({
    user_id: user.id,
    gateway,
    transaction_code: transactionCode,
    amount,
    status: "pending",
    items_snapshot: safeJsonStringify(itemsSnapshot),
    checkout_payload: safeJsonStringify(checkoutPayload),
  });

  return { transaction, transactionCode, amount };
};

const createMockWalletOrder = async (user, payload) => {
  const { transactionCode, amount } = await buildPendingTransaction(user, payload, "mockwallet");
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  return {
    transactionCode,
    amount,
    orderUrl: `${clientUrl}/mock-wallet?transactionCode=${encodeURIComponent(transactionCode)}`,
  };
};

const settleMockWalletTransaction = async (user, transactionCode, status) => {
  const transaction = await PaymentTransaction.findOne({
    where: {
      transaction_code: transactionCode,
      gateway: "mockwallet",
      user_id: user.id,
    },
  });

  if (!transaction) {
    throw new ApiError(404, "Payment transaction not found");
  }

  if (transaction.status === "paid") {
    return getPaymentTransaction(user, transactionCode);
  }

  if (transaction.status !== "pending") {
    throw new ApiError(400, "Payment transaction can no longer be changed");
  }

  if (status === "failed") {
    await transaction.update({
      status: "failed",
      gateway_response: safeJsonStringify({ simulatorStatus: "failed" }),
    });
    return getPaymentTransaction(user, transactionCode);
  }

  const [claimedCount] = await PaymentTransaction.update(
    {
      status: "processing",
      gateway_response: safeJsonStringify({ simulatorStatus: "paid" }),
    },
    {
      where: {
        id: transaction.id,
        status: "pending",
      },
    }
  );

  if (!claimedCount) {
    return getPaymentTransaction(user, transactionCode);
  }

  const checkoutPayload = safeJsonParse(transaction.checkout_payload, {});
  const itemsSnapshot = safeJsonParse(transaction.items_snapshot, []);

  try {
    const order = await orderService.createOrderFromPaymentSnapshot(Number(transaction.user_id), checkoutPayload.address, itemsSnapshot, {
      discountCode: checkoutPayload.discountCode,
      paymentMethod: checkoutPayload.paymentMethod,
      phone: checkoutPayload.phone,
      transactionCode: transaction.transaction_code,
      paidAmount: Number(transaction.amount),
    });

    await transaction.update({
      order_id: order.id,
      status: "paid",
      paid_at: new Date(),
      gateway_response: safeJsonStringify({ simulatorStatus: "paid", orderId: order.id }),
    });
  } catch (error) {
    await transaction.update({
      status: "failed",
      gateway_response: safeJsonStringify({ simulatorStatus: "failed", error: error.message }),
    });
    throw error;
  }

  return getPaymentTransaction(user, transactionCode);
};

const handleZaloPayCallback = async ({ data, mac }) => {
  const config = getZaloPayConfig();
  if (!config.key2) {
    return { return_code: 2, return_message: "ZaloPay key2 is not configured" };
  }

  const expectedMac = hmacSha256(data, config.key2);
  if (!isSameSignature(expectedMac, mac)) {
    return { return_code: 2, return_message: "Invalid" };
  }

  const callbackData = safeJsonParse(data);
  if (!callbackData?.app_trans_id) {
    return { return_code: 2, return_message: "Invalid data" };
  }

  const transaction = await PaymentTransaction.findOne({
    where: { transaction_code: callbackData.app_trans_id, gateway: "zalopay" },
  });

  if (!transaction) {
    return { return_code: 2, return_message: "Transaction not found" };
  }

  if (transaction.status === "paid") {
    return { return_code: 1, return_message: "Success" };
  }

  if (transaction.status === "processing") {
    return { return_code: 1, return_message: "Processing" };
  }

  if (Number(callbackData.amount) !== Number(transaction.amount)) {
    await transaction.update({
      status: "failed",
      gateway_response: safeJsonStringify(callbackData),
    });
    return { return_code: 2, return_message: "Invalid amount" };
  }

  const checkoutPayload = safeJsonParse(transaction.checkout_payload, {});
  const itemsSnapshot = safeJsonParse(transaction.items_snapshot, []);

  const [claimedCount] = await PaymentTransaction.update(
    {
      status: "processing",
      gateway_response: safeJsonStringify(callbackData),
    },
    {
      where: {
        id: transaction.id,
        status: "pending",
      },
    }
  );

  if (!claimedCount) {
    const freshTransaction = await PaymentTransaction.findByPk(transaction.id);
    return freshTransaction?.status === "paid"
      ? { return_code: 1, return_message: "Success" }
      : { return_code: 1, return_message: "Processing" };
  }

  try {
    const order = await orderService.createOrderFromPaymentSnapshot(Number(transaction.user_id), checkoutPayload.address, itemsSnapshot, {
      discountCode: checkoutPayload.discountCode,
      paymentMethod: "ZaloPay",
      phone: checkoutPayload.phone,
      transactionCode: transaction.transaction_code,
      paidAmount: Number(callbackData.amount),
    });

    await transaction.update({
      order_id: order.id,
      status: "paid",
      paid_at: new Date(),
      gateway_response: safeJsonStringify(callbackData),
    });
  } catch (error) {
    await transaction.update({
      status: "failed",
      gateway_response: safeJsonStringify({
        ...callbackData,
        error: error.message,
      }),
    });
    return { return_code: 2, return_message: error.message || "Cannot create paid order" };
  }

  return { return_code: 1, return_message: "Success" };
};

const getPaymentTransaction = async (user, transactionCode) => {
  const transaction = await PaymentTransaction.findOne({
    where: {
      transaction_code: transactionCode,
      user_id: user.id,
    },
  });

  if (!transaction) {
    throw new ApiError(404, "Payment transaction not found");
  }

  return {
    transactionCode: transaction.transaction_code,
    gateway: transaction.gateway,
    amount: Number(transaction.amount),
    status: transaction.status,
    orderId: transaction.order_id,
    paidAt: transaction.paid_at,
  };
};

const normalizeTransferContent = (payload = {}) =>
  String(
    payload.content ||
      payload.description ||
      payload.transferContent ||
      payload.transactionContent ||
      payload.memo ||
      ""
  ).toUpperCase();

const getTransferAmount = (payload = {}) => {
  const amount = payload.amount ?? payload.transferAmount ?? payload.transactionAmount ?? payload.money;
  return Number(amount);
};

const getBankTransferEntries = (payload = {}) => {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.transactions)) return payload.transactions;
  if (payload.data && typeof payload.data === "object") return [payload.data];
  return [payload];
};

const handleBankTransferWebhook = async (payload = {}) => {
  const webhookSecret = process.env.BANK_WEBHOOK_SECRET;
  if (webhookSecret && payload.secret !== webhookSecret) {
    throw new ApiError(401, "Invalid bank webhook secret");
  }

  const transferEntries = getBankTransferEntries(payload);
  const normalizedTransfers = transferEntries
    .map((entry) => ({
      raw: entry,
      amount: getTransferAmount(entry),
      content: normalizeTransferContent(entry),
    }))
    .filter((entry) => entry.content && !Number.isNaN(entry.amount) && entry.amount > 0);

  if (!normalizedTransfers.length) {
    throw new ApiError(400, "Invalid bank transfer payload");
  }

  const pendingTransactions = await PaymentTransaction.findAll({
    where: {
      gateway: "bank_transfer",
      status: "pending",
    },
  });

  const matchedResults = [];
  const matchedTransactionIds = new Set();

  for (const transfer of normalizedTransfers) {
    const matchedTransaction = pendingTransactions.find((transaction) => {
      const transactionCode = String(transaction.transaction_code || "").toUpperCase();
      return (
        !matchedTransactionIds.has(transaction.id) &&
        transactionCode &&
        transfer.content.includes(transactionCode) &&
        Number(transaction.amount) === transfer.amount
      );
    });

    if (!matchedTransaction) continue;
    matchedTransactionIds.add(matchedTransaction.id);

    const order = await orderService.confirmOrderPayment(matchedTransaction.order_id, {
      autoConfirmed: true,
      bankTransfer: {
        amount: transfer.amount,
        content: transfer.content,
        bankTransactionId: transfer.raw.bankTransactionId || transfer.raw.reference || transfer.raw.id || null,
        receivedAt: transfer.raw.receivedAt || new Date().toISOString(),
      },
    });

    matchedResults.push({
      orderId: order.id,
      transactionCode: matchedTransaction.transaction_code,
      status: order.paymentTransaction?.status || "paid",
    });
  }

  if (!matchedResults.length) {
    return {
      matched: false,
      message: "No pending bank transfer matched by content and amount",
    };
  }

  return {
    matched: true,
    count: matchedResults.length,
    payments: matchedResults,
  };
};

module.exports = {
  createZaloPayOrder,
  createMockWalletOrder,
  settleMockWalletTransaction,
  handleZaloPayCallback,
  getPaymentTransaction,
  handleBankTransferWebhook,
};
