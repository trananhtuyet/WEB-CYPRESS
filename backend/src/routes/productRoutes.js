const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  productController.createProduct
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  productController.updateProduct
);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), productController.deleteProduct);

module.exports = router;

