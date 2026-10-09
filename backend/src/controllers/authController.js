const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body);
  res.status(201).json(payload);
});

const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  res.json(payload);
});

module.exports = {
  register,
  login,
};

