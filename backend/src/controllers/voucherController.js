const asyncHandler = require("../utils/asyncHandler");
const voucherService = require("../services/voucherService");

const getVouchers = asyncHandler(async (req, res) => {
  const vouchers = await voucherService.getAllVouchers();
  res.json(vouchers);
});

const getActiveVouchers = asyncHandler(async (req, res) => {
  const vouchers = await voucherService.getActiveVouchers();
  res.json(vouchers);
});

const createVoucher = asyncHandler(async (req, res) => {
  const voucher = await voucherService.createVoucher(req.body);
  res.status(201).json(voucher);
});

const updateVoucher = asyncHandler(async (req, res) => {
  const voucher = await voucherService.updateVoucher(req.params.id, req.body);
  res.json(voucher);
});

const deleteVoucher = asyncHandler(async (req, res) => {
  await voucherService.deleteVoucher(req.params.id);
  res.json({ message: "Voucher deleted successfully" });
});

module.exports = {
  getVouchers,
  getActiveVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
};
