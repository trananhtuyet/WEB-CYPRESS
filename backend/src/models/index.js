const sequelize = require("../config/database");
const UserModel = require("./User");
const CategoryModel = require("./Category");
const ProductModel = require("./Product");
const CartModel = require("./Cart");
const CartItemModel = require("./CartItem");
const OrderModel = require("./Order");
const OrderItemModel = require("./OrderItem");
const PaymentTransactionModel = require("./PaymentTransaction");
const VoucherModel = require("./Voucher");
const ContactThreadModel = require("./ContactThread");
const ContactMessageModel = require("./ContactMessage");
const ProductReviewModel = require("./ProductReview");
const StyleChatHistoryModel = require("./StyleChatHistory");

const User = UserModel(sequelize);
const Category = CategoryModel(sequelize);
const Product = ProductModel(sequelize);
const Cart = CartModel(sequelize);
const CartItem = CartItemModel(sequelize);
const Order = OrderModel(sequelize);
const OrderItem = OrderItemModel(sequelize);
const PaymentTransaction = PaymentTransactionModel(sequelize);
const Voucher = VoucherModel(sequelize);
const ContactThread = ContactThreadModel(sequelize);
const ContactMessage = ContactMessageModel(sequelize);
const ProductReview = ProductReviewModel(sequelize);
const StyleChatHistory = StyleChatHistoryModel(sequelize);

Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });

Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
  onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product.hasMany(ProductReview, { foreignKey: "product_id", as: "reviews", onDelete: "CASCADE" });
ProductReview.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(ProductReview, { foreignKey: "user_id", as: "productReviews" });
ProductReview.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(PaymentTransaction, { foreignKey: "user_id", as: "paymentTransactions" });
PaymentTransaction.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasOne(PaymentTransaction, { foreignKey: "order_id", as: "paymentTransaction" });
PaymentTransaction.belongsTo(Order, { foreignKey: "order_id", as: "order" });

ContactThread.hasMany(ContactMessage, {
  foreignKey: "contact_id",
  as: "messages",
  onDelete: "CASCADE",
});
ContactMessage.belongsTo(ContactThread, { foreignKey: "contact_id", as: "thread" });

User.hasMany(StyleChatHistory, { foreignKey: "user_id", as: "styleChatHistories" });
StyleChatHistory.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  PaymentTransaction,
  Voucher,
  ContactThread,
  ContactMessage,
  ProductReview,
  StyleChatHistory,
};
