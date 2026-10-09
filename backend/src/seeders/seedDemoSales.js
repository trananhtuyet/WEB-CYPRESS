const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
const { sequelize, Cart, Order, OrderItem, PaymentTransaction, Product, User } = require("../models");

dotenv.config();

const customerNames = [
  "Nguyễn Minh Anh",
  "Trần Hoàng Linh",
  "Lê Ngọc Hân",
  "Phạm Gia Bảo",
  "Võ Thảo Nhi",
  "Đặng Quốc Huy",
  "Bùi Khánh Vy",
  "Hoàng Tuấn Kiệt",
  "Đỗ Mai Chi",
  "Phan Nhật Nam",
  "Vũ Thanh Trúc",
  "Ngô Bảo Châu",
  "Huỳnh Minh Quân",
  "Đinh Phương Anh",
  "Trịnh Hải Yến",
  "Cao Đức Anh",
  "Tạ Mỹ Duyên",
  "Lý Hoàng Phúc",
  "Mai Thanh Hà",
  "Lâm Bảo Ngọc",
  "Nguyễn Khánh Linh",
  "Trần Đức Minh",
  "Lê Hải Đăng",
  "Phạm Quỳnh Như",
];

const districts = [
  "Quận 1, TP. Hồ Chí Minh",
  "Quận 3, TP. Hồ Chí Minh",
  "Quận Bình Thạnh, TP. Hồ Chí Minh",
  "Quận Cầu Giấy, Hà Nội",
  "Quận Hai Bà Trưng, Hà Nội",
  "Quận Hải Châu, Đà Nẵng",
  "Quận Ninh Kiều, Cần Thơ",
  "Thành phố Thủ Đức, TP. Hồ Chí Minh",
];

const orderStatuses = ["confirmed", "shipping", "delivered", "delivered", "delivered", "pending"];
const paymentStatuses = ["paid", "paid", "paid", "paid", "pending"];

const getEnvNumber = (key, fallback) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const getRandomDate = () => {
  const value = new Date();
  value.setDate(value.getDate() - randomInt(0, 180));
  value.setHours(randomInt(9, 21), randomInt(0, 59), randomInt(0, 59), 0);
  return value;
};

const createOrGetDemoUsers = async (passwordHash, count) => {
  const users = [];

  for (let index = 0; index < count; index += 1) {
    const name = customerNames[index % customerNames.length];
    const email = `demo.customer${String(index + 1).padStart(2, "0")}@dolia.local`;
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        name,
        password: passwordHash,
        phone: `09${randomInt(10000000, 99999999)}`,
        address: `${randomInt(12, 388)} ${randomItem(["Nguyễn Trãi", "Lê Lợi", "Hai Bà Trưng", "Điện Biên Phủ"])}, ${randomItem(districts)}`,
        role: "user",
      },
    });

    await Cart.findOrCreate({ where: { user_id: user.id } });
    users.push(user);
  }

  return users;
};

const createDemoOrder = async ({ user, products, batchCode }) => {
  const pickedProducts = shuffle(products).slice(0, randomInt(1, 4));
  const items = pickedProducts.map((product) => ({
    product,
    quantity: randomInt(1, 3),
    price: Number(product.price),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const createdAt = getRandomDate();
  const orderStatus = randomItem(orderStatuses);
  const paymentStatus = randomItem(paymentStatuses);
  const paymentMethod = paymentStatus === "paid" ? "Ví điện tử mô phỏng" : "COD / chuyển khoản";

  const order = await Order.create({
    user_id: user.id,
    total_price: subtotal,
    status: paymentStatus === "paid" && orderStatus === "pending" ? "confirmed" : orderStatus,
    address: [
      `Người nhận: ${user.name}`,
      `Địa chỉ: ${user.address}`,
      `SĐT nhận hàng: ${user.phone}`,
      `Thanh toán: ${paymentMethod}`,
      `Demo sales batch: ${batchCode}`,
    ].join("\n"),
    created_at: createdAt,
    updated_at: createdAt,
  });

  for (const item of items) {
    await OrderItem.create({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.price,
    });
  }

  if (paymentStatus !== "unpaid") {
    await PaymentTransaction.create({
      user_id: user.id,
      order_id: order.id,
      gateway: "mockwallet",
      transaction_code: `demo_${order.id}_${Date.now()}_${randomInt(100, 999)}`,
      amount: subtotal,
      status: paymentStatus,
      items_snapshot: JSON.stringify(items.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      }))),
      checkout_payload: JSON.stringify({
        address: user.address,
        phone: user.phone,
        paymentMethod,
        discountCode: "",
      }),
      gateway_response: JSON.stringify({ simulatorStatus: paymentStatus, batchCode }),
      paid_at: paymentStatus === "paid" ? createdAt : null,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  return order;
};

const seedDemoSales = async () => {
  const customerCount = getEnvNumber("DEMO_CUSTOMERS", 24);
  const orderCount = getEnvNumber("DEMO_ORDERS", 56);
  const batchCode = `demo-${Date.now()}`;

  await sequelize.authenticate();

  const products = await Product.findAll({
    where: {
      price: { [Op.gt]: 0 },
    },
  });

  if (!products.length) {
    throw new Error("Cannot create demo sales because there are no products.");
  }

  const passwordHash = await bcrypt.hash("User@123", 10);
  const users = await createOrGetDemoUsers(passwordHash, customerCount);
  const orders = [];

  for (let index = 0; index < orderCount; index += 1) {
    orders.push(await createDemoOrder({
      user: users[index % users.length],
      products,
      batchCode,
    }));
  }

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0);
  console.log(`Created ${users.length} demo customers.`);
  console.log(`Created ${orders.length} demo orders.`);
  console.log(`Added demo revenue: ${Math.round(totalRevenue).toLocaleString("vi-VN")} VND.`);
  console.log(`Batch code: ${batchCode}`);
};

seedDemoSales()
  .catch((error) => {
    console.error("Failed to seed demo sales:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
