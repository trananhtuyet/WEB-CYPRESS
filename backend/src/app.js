const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { DataTypes } = require("sequelize");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const styleChatRoutes = require("./routes/styleChatRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const voucherService = require("./services/voucherService");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ensureOrderStatusColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await sequelize.query(
    "UPDATE orders SET status = 'pending' WHERE status NOT IN (:statuses) OR status IS NULL",
    { replacements: { statuses: ["pending", "confirmed", "shipping", "delivered", "cancelled"] } }
  );
  await queryInterface.changeColumn("orders", "status", {
    type: DataTypes.ENUM("pending", "confirmed", "shipping", "delivered", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  });
};

const ensurePaymentTransactionStatusColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await sequelize.query(
    "UPDATE payment_transactions SET status = 'pending' WHERE status NOT IN (:statuses) OR status IS NULL",
    { replacements: { statuses: ["pending", "processing", "paid", "failed", "cancelled"] } }
  );
  await queryInterface.changeColumn("payment_transactions", "status", {
    type: DataTypes.ENUM("pending", "processing", "paid", "failed", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  });
};

const ensureUserAvatarColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("users");

  if (!table.avatar) {
    await queryInterface.addColumn("users", "avatar", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }
};

const ensureVoucherSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  const hasVoucherTable = tables
    .map((table) => (typeof table === "object" ? table.tableName || table.name : table))
    .includes("vouchers");

  if (!hasVoucherTable) return;

  await queryInterface.changeColumn("vouchers", "type", {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "percent",
  });
};

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/style-chat", styleChatRoutes);
app.use("/api/vouchers", voucherRoutes);

app.use(errorMiddleware);

sequelize
  .authenticate()
  .then(() => sequelize.sync())
  .then(() => ensureOrderStatusColumn())
  .then(() => ensurePaymentTransactionStatusColumn())
  .then(() => ensureUserAvatarColumn())
  .then(() => ensureVoucherSchema())
  .then(() => voucherService.ensureDefaultVouchers())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message || error);
    if (error?.original?.code) {
      console.error("Database error code:", error.original.code);
    }
    if (error?.original?.sqlMessage) {
      console.error("Database error detail:", error.original.sqlMessage);
    }
    process.exit(1);
  });
