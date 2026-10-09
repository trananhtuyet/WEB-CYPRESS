const ApiError = require("../utils/ApiError");

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission for this action"));
  }

  next();
};

module.exports = roleMiddleware;

