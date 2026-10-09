const express = require("express");
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateCart);
router.delete("/remove", cartController.removeCartItem);

module.exports = router;

