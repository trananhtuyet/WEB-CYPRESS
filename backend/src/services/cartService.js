const { Cart, CartItem, Category, Product } = require("../models");
const ApiError = require("../utils/ApiError");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    where: { user_id: userId },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
          },
        ],
      },
    ],
    order: [[{ model: CartItem, as: "items" }, "id", "DESC"]],
  });

  if (!cart) {
    cart = await Cart.create({ user_id: userId });
    cart = await getOrCreateCart(userId);
  }

  return cart;
};

const formatCart = (cart) => {
  const items = cart.items || [];
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return {
    id: cart.id,
    user_id: cart.user_id,
    items,
    totalPrice,
  };
};

const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return formatCart(cart);
};

const addToCart = async (userId, { product_id, quantity }) => {
  const product = await Product.findByPk(product_id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const cart = await getOrCreateCart(userId);
  const requestedQuantity = Number(quantity) || 1;

  if (product.stock < requestedQuantity) {
    throw new ApiError(400, "Insufficient stock");
  }

  const existingItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + requestedQuantity;
    if (product.stock < newQuantity) {
      throw new ApiError(400, "Insufficient stock");
    }
    await existingItem.update({ quantity: newQuantity });
  } else {
    await CartItem.create({
      cart_id: cart.id,
      product_id,
      quantity: requestedQuantity,
    });
  }

  return getCart(userId);
};

const updateCartItem = async (userId, { product_id, quantity }) => {
  const cart = await getOrCreateCart(userId);
  const cartItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  const product = await Product.findByPk(product_id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (quantity <= 0) {
    await cartItem.destroy();
  } else {
    if (product.stock < quantity) {
      throw new ApiError(400, "Insufficient stock");
    }
    await cartItem.update({ quantity });
  }

  return getCart(userId);
};

const removeCartItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  const cartItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id: productId },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  await cartItem.destroy();
  return getCart(userId);
};

const clearCart = async (cartId, transaction) => {
  await CartItem.destroy({ where: { cart_id: cartId }, transaction });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
