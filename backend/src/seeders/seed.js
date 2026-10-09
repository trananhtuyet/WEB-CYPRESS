const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { sequelize, Category, Product, User, Cart } = require("../models");
const { categories, products } = require("./catalogData");

dotenv.config();

const seed = async () => {
  await sequelize.sync({ force: true });

  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await User.create({
    name: "Admin",
    email: "admin@cosmetics.local",
    password: hashedPassword,
    phone: "0123456789",
    address: "Laragon Sample Address",
    role: "admin",
  });
  await Cart.create({ user_id: admin.id });

  const userPassword = await bcrypt.hash("User@123", 10);
  const user = await User.create({
    name: "Demo User",
    email: "user@cosmetics.local",
    password: userPassword,
    phone: "0987654321",
    address: "Ho Chi Minh City",
    role: "user",
  });
  await Cart.create({ user_id: user.id });

  const categoryMap = {};
  for (const name of categories) {
    const category = await Category.create({ name });
    categoryMap[name] = category.id;
  }

  for (const product of products) {
    await Product.create({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: product.stock,
      category_id: categoryMap[product.category],
    });
  }

  console.log("Database seeded successfully");
  console.log("Admin account: admin@cosmetics.local / Admin@123");
  console.log("User account: user@cosmetics.local / User@123");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
