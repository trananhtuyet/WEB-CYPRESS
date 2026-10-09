const express = require("express");
const contactController = require("../controllers/contactController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", contactController.createContact);
router.get("/lookup", contactController.getCustomerContacts);
router.post("/:id/customer-replies", contactController.addCustomerReply);

router.use(authMiddleware, roleMiddleware("admin"));
router.get("/", contactController.getContacts);
router.post("/:id/replies", contactController.addAdminReply);
router.patch("/:id/status", contactController.updateContactStatus);

module.exports = router;
