const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/userService");

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.user);
  res.json(user);
});

const buildImagePath = (req) =>
  req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : undefined;

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body, buildImagePath(req));
  res.json(user);
});

module.exports = {
  getUsers,
  getUser,
  updateProfile,
};
