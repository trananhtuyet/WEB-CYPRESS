const bcrypt = require("bcryptjs");
const { User, Cart } = require("../models");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../utils/jwt");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  avatar: user.avatar,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const register = async (payload) => {
  const existingUser = await User.findOne({ where: { email: payload.email } });
  if (existingUser) {
    throw new ApiError(400, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });

  await Cart.create({ user_id: user.id });

  return {
    user: sanitizeUser(user),
    token: generateToken({ id: user.id, role: user.role }),
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: sanitizeUser(user),
    token: generateToken({ id: user.id, role: user.role }),
  };
};

module.exports = {
  register,
  login,
};
