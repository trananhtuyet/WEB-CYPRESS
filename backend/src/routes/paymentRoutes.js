const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/zalopay/create", authMiddleware, paymentController.createZaloPayOrder);
router.post("/zalopay/callback", paymentController.handleZaloPayCallback);
router.post("/bank-transfer/webhook", paymentController.handleBankTransferWebhook);
router.post("/mock-wallet/create", authMiddleware, paymentController.createMockWalletOrder);
router.post("/mock-wallet/:transactionCode/confirm", authMiddleware, paymentController.confirmMockWalletPayment);
router.post("/mock-wallet/:transactionCode/fail", authMiddleware, paymentController.failMockWalletPayment);
router.post("/orders/:orderId/confirm", authMiddleware, roleMiddleware("admin"), paymentController.confirmOrderPayment);
router.get("/transactions/:transactionCode", authMiddleware, paymentController.getPaymentTransaction);

module.exports = router;
