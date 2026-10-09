const asyncHandler = require("../utils/asyncHandler");
const styleChatService = require("../services/styleChatService");

const askStyleAssistant = asyncHandler(async (req, res) => {
  const result = await styleChatService.askStyleAssistant({
    message: req.body.message,
    history: req.body.history,
  });

  res.json(result);
});

module.exports = {
  askStyleAssistant,
};
