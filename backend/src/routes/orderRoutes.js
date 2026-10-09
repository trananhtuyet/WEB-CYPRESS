const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/", orderController.createOrder);
router.get("/user", orderController.getUserOrders);
router.get("/admin", roleMiddleware("admin"), orderController.getAdminOrders);
router.put("/:id/status", roleMiddleware("admin"), orderController.updateOrderStatus);
router.put("/:id", roleMiddleware("admin"), orderController.updateOrder);

module.exports = router;
