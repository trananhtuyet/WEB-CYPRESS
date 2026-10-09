const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/orderService");

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body.address, req.body.selectedProductIds, {
    discountCode: req.body.discountCode,
    paymentMethod: req.body.paymentMethod,
    phone: req.body.phone,
  });
  res.status(201).json(order);
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.json(orders);
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.json(order);
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, { status: req.body.status });
  res.json(order);
});

module.exports = {
  createOrder,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
  updateOrder,
};
