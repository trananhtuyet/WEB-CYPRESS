const express = require("express");
const styleChatController = require("../controllers/styleChatController");

const router = express.Router();

router.post("/", styleChatController.askStyleAssistant);

module.exports = router;
