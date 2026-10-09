const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.put("/me", upload.single("avatar"), userController.updateProfile);
router.get("/", roleMiddleware("admin"), userController.getUsers);
router.get("/:id", userController.getUser);

module.exports = router;
