const { User } = require("../models");
const ApiError = require("../utils/ApiError");

const publicUserAttributes = { exclude: ["password"] };

const getAllUsers = async () =>
  User.findAll({
    attributes: publicUserAttributes,
    order: [["created_at", "DESC"]],
  });

const getUserById = async (id, requester) => {
  if (requester.role !== "admin" && requester.id !== Number(id)) {
    throw new ApiError(403, "You do not have permission for this resource");
  }

  const user = await User.findByPk(id, {
    attributes: publicUserAttributes,
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

const updateProfile = async (requester, payload, avatar) => {
  const user = await User.findByPk(requester.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updates = {};
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const phone = String(payload.phone || "").trim();
  const address = String(payload.address || "").trim();

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Invalid email address");
  }

  const emailOwner = await User.findOne({ where: { email } });
  if (emailOwner && emailOwner.id !== user.id) {
    throw new ApiError(409, "Email is already in use");
  }

  updates.name = name;
  updates.email = email;
  updates.phone = phone || null;
  updates.address = address || null;

  if (avatar) {
    updates.avatar = avatar;
  }

  await user.update(updates);

  return User.findByPk(user.id, {
    attributes: publicUserAttributes,
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
};
