const { Category } = require("../models");

const getCategories = async () => Category.findAll({ order: [["name", "ASC"]] });

module.exports = {
  getCategories,
};

