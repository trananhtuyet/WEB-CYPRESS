const jwt = require("jsonwebtoken");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return next(new ApiError(401, "Invalid authentication token"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

module.exports = authMiddleware;

