const asyncHandler = require("../utils/asyncHandler");
const categoryService = require("../services/categoryService");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  res.json(categories);
});

module.exports = {
  getCategories,
};

