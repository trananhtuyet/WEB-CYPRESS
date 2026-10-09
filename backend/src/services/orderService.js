const { Op } = require("sequelize");
const { sequelize, Cart, CartItem, Order, OrderItem, PaymentTransaction, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const { clearCart } = require("./cartService");
const voucherService = require("./voucherService");

const VALID_ORDER_STATUSES = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const calculateDiscount = (subtotal, discountCode, options) =>
  voucherService.calculateDiscount(subtotal, discountCode, options);

const calculateOrderTotal = async (subtotal, discountCode, options) =>
  Math.max(subtotal - await calculateDiscount(subtotal, discountCode, options), 0);

const buildContactAddress = (address, options = {}) =>
  [
    String(address).trim(),
    options.phone ? `SĐT nhận hàng: ${options.phone}` : "",
    options.paymentMethod ? `Thanh toán: ${options.paymentMethod}` : "",
    options.discountCode ? `Mã giảm giá: ${String(options.discountCode).trim().toUpperCase()}` : "",
    options.transactionCode ? `Mã giao dịch: ${options.transactionCode}` : "",
  ].filter(Boolean).join("\n");

const getManualPaymentGateway = (paymentMethod = "") => {
  const normalizedMethod = String(paymentMethod).toLowerCase();
  if (normalizedMethod.includes("chuyển khoản") || normalizedMethod.includes("bank")) {
    return "bank_transfer";
  }
  if (normalizedMethod.includes("nhận hàng") || normalizedMethod.includes("cod")) {
    return "cod";
  }
  return null;
};

const buildManualTransactionCode = (gateway, orderId) => {
  const prefix = gateway === "bank_transfer" ? "BANK" : "COD";
  return `${prefix}-DH${String(orderId).padStart(4, "0")}`;
};

const orderInclude = [
  { model: User, as: "user", attributes: ["id", "name", "email"] },
  { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
  { model: PaymentTransaction, as: "paymentTransaction" },
];

const createOrder = async (userId, address, selectedProductIds = [], options = {}) => {
  if (!address || !String(address).trim()) {
    throw new ApiError(400, "Shipping address is required");
  }

  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
  });

  if (!cart || !cart.items.length) {
    throw new ApiError(400, "Cart is empty");
  }

  const normalizedSelectedIds = Array.isArray(selectedProductIds)
    ? selectedProductIds.map((id) => Number(id)).filter(Boolean)
    : [];
  const selectedItems = normalizedSelectedIds.length
    ? cart.items.filter((item) => normalizedSelectedIds.includes(Number(item.product_id)))
    : cart.items;

  if (!selectedItems.length) {
    throw new ApiError(400, "No selected cart items to checkout");
  }

  const transaction = await sequelize.transaction();

  try {
    let totalPrice = 0;
    for (const item of selectedItems) {
      if (item.product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }
      totalPrice += Number(item.product.price) * item.quantity;
    }

    const finalTotal = await calculateOrderTotal(totalPrice, options.discountCode, { throwOnInvalid: true });
    const contactAddress = buildContactAddress(address, options);
    const itemsSnapshot = selectedItems.map((item) => ({
      product_id: Number(item.product_id),
      name: item.product.name,
      price: Number(item.product.price),
      quantity: Number(item.quantity),
    }));

    const order = await Order.create(
      {
        user_id: userId,
        total_price: finalTotal,
        address: contactAddress,
        status: "pending",
      },
      { transaction }
    );

    for (const item of selectedItems) {
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price,
        },
        { transaction }
      );

      await item.product.update(
        { stock: item.product.stock - item.quantity },
        { transaction }
      );
    }

    if (normalizedSelectedIds.length) {
      await CartItem.destroy({
        where: {
          cart_id: cart.id,
          product_id: { [Op.in]: selectedItems.map((item) => item.product_id) },
        },
        transaction,
      });
    } else {
      await clearCart(cart.id, transaction);
    }

    const manualGateway = getManualPaymentGateway(options.paymentMethod);
    if (manualGateway) {
      await PaymentTransaction.create(
        {
          user_id: userId,
          order_id: order.id,
          gateway: manualGateway,
          transaction_code: buildManualTransactionCode(manualGateway, order.id),
          amount: finalTotal,
          status: "pending",
          items_snapshot: JSON.stringify(itemsSnapshot),
          checkout_payload: JSON.stringify({
            address,
            phone: options.phone || "",
            paymentMethod: options.paymentMethod || "",
            discountCode: options.discountCode || "",
          }),
        },
        { transaction }
      );
    }

    await voucherService.markVoucherUsed(options.discountCode, transaction);

    await transaction.commit();

    return Order.findByPk(order.id, {
      include: orderInclude,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createOrderFromPaymentSnapshot = async (userId, address, itemsSnapshot = [], options = {}) => {
  if (!address || !String(address).trim()) {
    throw new ApiError(400, "Shipping address is required");
  }

  if (!Array.isArray(itemsSnapshot) || !itemsSnapshot.length) {
    throw new ApiError(400, "No paid items to checkout");
  }

  const transaction = await sequelize.transaction();

  try {
    let subtotal = 0;
    const orderItems = [];

    for (const snapshotItem of itemsSnapshot) {
      const productId = Number(snapshotItem.product_id);
      const quantity = Number(snapshotItem.quantity);
      const price = Number(snapshotItem.price);

      if (!productId || !quantity || quantity < 1 || Number.isNaN(price) || price < 0) {
        throw new ApiError(400, "Invalid paid item payload");
      }

      const product = await Product.findByPk(productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        throw new ApiError(400, `Product ${productId} is no longer available`);
      }

      if (Number(product.stock) < quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      subtotal += price * quantity;
      orderItems.push({ product, productId, quantity, price });
    }

    const finalTotal = await calculateOrderTotal(subtotal, options.discountCode, { throwOnInvalid: true });
    const paidAmount = Number(options.paidAmount);
    if (!Number.isNaN(paidAmount) && paidAmount !== finalTotal) {
      throw new ApiError(400, "Paid amount does not match order total");
    }

    const order = await Order.create(
      {
        user_id: userId,
        total_price: finalTotal,
        address: buildContactAddress(address, options),
        status: "confirmed",
      },
      { transaction }
    );

    for (const item of orderItems) {
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
        { transaction }
      );

      await item.product.update(
        { stock: Number(item.product.stock) - item.quantity },
        { transaction }
      );
    }

    const cart = await Cart.findOne({ where: { user_id: userId }, transaction });
    if (cart) {
      await CartItem.destroy({
        where: {
          cart_id: cart.id,
          product_id: { [Op.in]: orderItems.map((item) => item.productId) },
        },
        transaction,
      });
    }

    await voucherService.markVoucherUsed(options.discountCode, transaction);

    await transaction.commit();

    return Order.findByPk(order.id, {
      include: orderInclude,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserOrders = async (userId) =>
  Order.findAll({
    where: { user_id: userId },
    include: [
      { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
      { model: PaymentTransaction, as: "paymentTransaction" },
    ],
    order: [["created_at", "DESC"]],
  });

const getAllOrders = async () =>
  Order.findAll({
    include: orderInclude,
    order: [["created_at", "DESC"]],
  });

const updateOrderStatus = async (orderId, status) => {
  if (!VALID_ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await order.update({ status });
  return Order.findByPk(order.id, {
    include: orderInclude,
  });
};

const updateOrder = async (orderId, payload) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const updates = {};
  if (payload.status !== undefined) {
    if (!VALID_ORDER_STATUSES.includes(payload.status)) {
      throw new ApiError(400, "Invalid order status");
    }
    updates.status = payload.status;
  }
  if (payload.address !== undefined) {
    if (!String(payload.address).trim()) {
      throw new ApiError(400, "Shipping address is required");
    }
    updates.address = payload.address;
  }
  if (payload.total_price !== undefined) {
    const totalPrice = Number(payload.total_price);
    if (Number.isNaN(totalPrice) || totalPrice < 0) {
      throw new ApiError(400, "Invalid order total");
    }
    updates.total_price = totalPrice;
  }

  await order.update(updates);
  return Order.findByPk(order.id, {
    include: orderInclude,
  });
};

const confirmOrderPayment = async (orderId, confirmation = {}) => {
  const order = await Order.findByPk(orderId, {
    include: [{ model: PaymentTransaction, as: "paymentTransaction" }],
  });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const paymentTransaction = order.paymentTransaction;
  if (!paymentTransaction) {
    throw new ApiError(400, "Order does not have a payment transaction");
  }

  if (paymentTransaction.status !== "paid") {
    const paidAt = new Date();
    await paymentTransaction.update({
      status: "paid",
      paid_at: paidAt,
      gateway_response: JSON.stringify({
        confirmedManually: !confirmation.autoConfirmed,
        autoConfirmed: Boolean(confirmation.autoConfirmed),
        confirmedAt: paidAt.toISOString(),
        bankTransfer: confirmation.bankTransfer || null,
      }),
    });
  }

  if (order.status === "pending") {
    await order.update({ status: "confirmed" });
  }

  return Order.findByPk(order.id, {
    include: orderInclude,
  });
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  confirmOrderPayment,
  createOrderFromPaymentSnapshot,
  calculateDiscount,
  calculateOrderTotal,
};
