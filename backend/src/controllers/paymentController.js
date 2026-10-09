const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");
const orderService = require("../services/orderService");

const createZaloPayOrder = asyncHandler(async (req, res) => {
  const data = await paymentService.createZaloPayOrder(req.user, req.body);
  res.status(201).json(data);
});

const createMockWalletOrder = asyncHandler(async (req, res) => {
  const data = await paymentService.createMockWalletOrder(req.user, req.body);
  res.status(201).json(data);
});

const confirmMockWalletPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.settleMockWalletTransaction(req.user, req.params.transactionCode, "paid");
  res.json(result);
});

const failMockWalletPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.settleMockWalletTransaction(req.user, req.params.transactionCode, "failed");
  res.json(result);
});

const handleZaloPayCallback = asyncHandler(async (req, res) => {
  const result = await paymentService.handleZaloPayCallback(req.body);
  res.json(result);
});

const handleBankTransferWebhook = asyncHandler(async (req, res) => {
  const result = await paymentService.handleBankTransferWebhook(req.body);
  res.json(result);
});

const getPaymentTransaction = asyncHandler(async (req, res) => {
  const result = await paymentService.getPaymentTransaction(req.user, req.params.transactionCode);
  res.json(result);
});

const confirmOrderPayment = asyncHandler(async (req, res) => {
  const result = await orderService.confirmOrderPayment(req.params.orderId);
  res.json(result);
});

module.exports = {
  createZaloPayOrder,
  createMockWalletOrder,
  confirmMockWalletPayment,
  failMockWalletPayment,
  handleZaloPayCallback,
  handleBankTransferWebhook,
  getPaymentTransaction,
  confirmOrderPayment,
};
