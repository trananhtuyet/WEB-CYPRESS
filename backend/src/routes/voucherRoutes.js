const express = require("express");
const voucherController = require("../controllers/voucherController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/active", voucherController.getActiveVouchers);
router.get("/", authMiddleware, roleMiddleware("admin"), voucherController.getVouchers);
router.post("/", authMiddleware, roleMiddleware("admin"), voucherController.createVoucher);
router.put("/:id", authMiddleware, roleMiddleware("admin"), voucherController.updateVoucher);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), voucherController.deleteVoucher);

module.exports = router;
