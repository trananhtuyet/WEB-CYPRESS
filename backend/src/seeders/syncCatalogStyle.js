const dotenv = require("dotenv");
const { sequelize, Category, Product } = require("../models");
const { categories, products } = require("./catalogData");

dotenv.config();

const syncCatalogStyle = async () => {
  await sequelize.authenticate();

  const categoryMap = {};
  for (const name of categories) {
    const [category] = await Category.findOrCreate({ where: { name }, defaults: { name } });
    categoryMap[name] = category.id;
  }

  const existingProducts = await Product.findAll({ order: [["id", "ASC"]] });
  let updatedCount = 0;
  let createdCount = 0;

  for (const [index, product] of products.entries()) {
    const payload = {
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: product.stock,
      category_id: categoryMap[product.category],
    };

    const existingProduct = existingProducts[index];
    if (existingProduct) {
      await existingProduct.update(payload);
      updatedCount += 1;
    } else {
      await Product.create(payload);
      createdCount += 1;
    }
  }

  console.log(`Catalog synced. Updated ${updatedCount} product(s), created ${createdCount} product(s).`);
};

syncCatalogStyle()
  .catch((error) => {
    console.error("Failed to sync Korean-style catalog:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
