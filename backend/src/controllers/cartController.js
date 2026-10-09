const asyncHandler = require("../utils/asyncHandler");
const cartService = require("../services/cartService");

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json(cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const cart = await cartService.addToCart(req.user.id, req.body);
  res.json(cart);
});

const updateCart = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(req.user.id, req.body);
  res.json(cart);
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCartItem(req.user.id, req.body.product_id);
  res.json(cart);
});

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeCartItem,
};

