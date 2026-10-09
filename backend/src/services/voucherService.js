const { Op } = require("sequelize");
const { sequelize, Voucher } = require("../models");
const ApiError = require("../utils/ApiError");

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

const VOUCHER_TYPES = ["percent", "fixed", "tiered", "free_shipping", "gift"];

const defaultVouchers = [
  {
    code: "DOLIA10",
    name: "Giảm 10%",
    type: "percent",
    value: 10,
    min_order_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "DOLIA15",
    name: "Giảm 15% cho đơn từ 899K",
    type: "percent",
    value: 15,
    min_order_amount: 899000,
    max_discount_amount: 180000,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "NEW50",
    name: "Giảm 50K",
    type: "fixed",
    value: 50000,
    min_order_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "SAVE80",
    name: "Giảm 80K cho đơn từ 1.2 triệu",
    type: "fixed",
    value: 80000,
    min_order_amount: 1200000,
    max_discount_amount: null,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "LUXE120",
    name: "Giảm 120K cho đơn từ 1.8 triệu",
    type: "fixed",
    value: 120000,
    min_order_amount: 1800000,
    max_discount_amount: null,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "FREESHIP",
    name: "Miễn phí vận chuyển",
    type: "free_shipping",
    value: 0,
    min_order_amount: 199000,
    max_discount_amount: null,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "VIP20",
    name: "Giảm 20% tối đa 250K",
    type: "percent",
    value: 20,
    min_order_amount: 1499000,
    max_discount_amount: 250000,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "WEEKEND12",
    name: "Giảm 12% cuối tuần",
    type: "percent",
    value: 12,
    min_order_amount: 599000,
    max_discount_amount: 120000,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "COMBO25",
    name: "Giảm 25% theo bậc cho đơn lớn",
    type: "tiered",
    value: 25,
    min_order_amount: 2499000,
    max_discount_amount: 320000,
    usage_limit: null,
    is_active: true,
  },
  {
    code: "GIFTSTYLE",
    name: "Quà tặng phụ kiện",
    type: "gift",
    value: 0,
    min_order_amount: 699000,
    max_discount_amount: null,
    usage_limit: null,
    is_active: true,
  },
];

const serializeVoucher = (voucher) => ({
  id: voucher.id,
  code: voucher.code,
  name: voucher.name,
  type: voucher.type,
  value: Number(voucher.value),
  min_order_amount: Number(voucher.min_order_amount || 0),
  max_discount_amount: voucher.max_discount_amount === null ? null : Number(voucher.max_discount_amount),
  usage_limit: voucher.usage_limit,
  used_count: voucher.used_count,
  starts_at: voucher.starts_at,
  ends_at: voucher.ends_at,
  is_active: voucher.is_active,
  created_at: voucher.created_at,
  updated_at: voucher.updated_at,
});

const ensureDefaultVouchers = async () => {
  for (const voucher of defaultVouchers) {
    const [record] = await Voucher.findOrCreate({
      where: { code: voucher.code },
      defaults: voucher,
    });

    const recordJson = record.toJSON();
    const needsUpdate = Object.entries(voucher).some(([key, value]) => recordJson[key] !== value);

    if (needsUpdate) {
      await record.update(voucher);
    }
  }
};

const validateVoucherPayload = (payload, { partial = false } = {}) => {
  const requiredFields = ["code", "name", "type", "value"];
  if (!partial) {
    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        throw new ApiError(400, `${field} is required`);
      }
    }
  }

  if (payload.type !== undefined && !VOUCHER_TYPES.includes(payload.type)) {
    throw new ApiError(400, "Invalid voucher type");
  }

  if (payload.value !== undefined) {
    const value = Number(payload.value);
    const zeroValueTypes = ["free_shipping", "gift"];
    if (Number.isNaN(value) || (zeroValueTypes.includes(payload.type) ? value < 0 : value <= 0)) {
      throw new ApiError(400, "Voucher value must be greater than 0");
    }
    if (["percent", "tiered"].includes(payload.type) && value > 100) {
      throw new ApiError(400, "Percent voucher cannot be greater than 100");
    }
  }

  for (const field of ["min_order_amount", "max_discount_amount"]) {
    if (payload[field] !== undefined && payload[field] !== "" && payload[field] !== null && Number(payload[field]) < 0) {
      throw new ApiError(400, `${field} must be greater than or equal to 0`);
    }
  }

  if (payload.usage_limit !== undefined && payload.usage_limit !== "" && payload.usage_limit !== null) {
    const usageLimit = Number(payload.usage_limit);
    if (!Number.isInteger(usageLimit) || usageLimit < 1) {
      throw new ApiError(400, "Usage limit must be a positive integer");
    }
  }
};

const normalizePayload = (payload) => ({
  ...(payload.code !== undefined ? { code: normalizeCode(payload.code) } : {}),
  ...(payload.name !== undefined ? { name: String(payload.name).trim() } : {}),
  ...(payload.type !== undefined ? { type: payload.type } : {}),
  ...(payload.value !== undefined ? { value: Number(payload.value) } : {}),
  ...(payload.min_order_amount !== undefined ? { min_order_amount: Number(payload.min_order_amount || 0) } : {}),
  ...(payload.max_discount_amount !== undefined
    ? { max_discount_amount: payload.max_discount_amount === "" || payload.max_discount_amount === null ? null : Number(payload.max_discount_amount) }
    : {}),
  ...(payload.usage_limit !== undefined
    ? { usage_limit: payload.usage_limit === "" || payload.usage_limit === null ? null : Number(payload.usage_limit) }
    : {}),
  ...(payload.starts_at !== undefined ? { starts_at: payload.starts_at ? new Date(payload.starts_at) : null } : {}),
  ...(payload.ends_at !== undefined ? { ends_at: payload.ends_at ? new Date(payload.ends_at) : null } : {}),
  ...(payload.is_active !== undefined ? { is_active: Boolean(payload.is_active) } : {}),
});

const getAllVouchers = async () => {
  const vouchers = await Voucher.findAll({ order: [["created_at", "DESC"]] });
  return vouchers.map(serializeVoucher);
};

const getActiveVouchers = async () => {
  const now = new Date();
  const vouchers = await Voucher.findAll({
    where: {
      is_active: true,
      [Op.and]: [
        { [Op.or]: [{ starts_at: null }, { starts_at: { [Op.lte]: now } }] },
        { [Op.or]: [{ ends_at: null }, { ends_at: { [Op.gte]: now } }] },
        { [Op.or]: [{ usage_limit: null }, sequelize.where(sequelize.col("used_count"), Op.lt, sequelize.col("usage_limit"))] },
      ],
    },
    order: [["created_at", "DESC"]],
  });

  return vouchers.map(serializeVoucher);
};

const createVoucher = async (payload) => {
  const normalizedPayload = normalizePayload(payload);
  validateVoucherPayload(normalizedPayload);

  const existing = await Voucher.findOne({ where: { code: normalizedPayload.code } });
  if (existing) {
    throw new ApiError(409, "Voucher code already exists");
  }

  const voucher = await Voucher.create(normalizedPayload);
  return serializeVoucher(voucher);
};

const updateVoucher = async (id, payload) => {
  const voucher = await Voucher.findByPk(id);
  if (!voucher) {
    throw new ApiError(404, "Voucher not found");
  }

  const normalizedPayload = normalizePayload(payload);
  validateVoucherPayload({ ...voucher.toJSON(), ...normalizedPayload }, { partial: true });

  if (normalizedPayload.code && normalizedPayload.code !== voucher.code) {
    const existing = await Voucher.findOne({ where: { code: normalizedPayload.code } });
    if (existing) {
      throw new ApiError(409, "Voucher code already exists");
    }
  }

  await voucher.update(normalizedPayload);
  return serializeVoucher(voucher);
};

const deleteVoucher = async (id) => {
  const voucher = await Voucher.findByPk(id);
  if (!voucher) {
    throw new ApiError(404, "Voucher not found");
  }
  await voucher.destroy();
};

const calculateDiscount = async (subtotal, discountCode, { throwOnInvalid = false } = {}) => {
  const code = normalizeCode(discountCode);
  if (!code) return 0;

  const voucher = await Voucher.findOne({ where: { code } });
  const now = new Date();
  const invalid =
    !voucher ||
    !voucher.is_active ||
    (voucher.starts_at && voucher.starts_at > now) ||
    (voucher.ends_at && voucher.ends_at < now) ||
    (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) ||
    Number(subtotal) < Number(voucher.min_order_amount || 0);

  if (invalid) {
    if (throwOnInvalid) {
      throw new ApiError(400, "Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện");
    }
    return 0;
  }

  let rawDiscount = 0;
  if (voucher.type === "percent" || voucher.type === "tiered") {
    rawDiscount = Math.round(Number(subtotal) * (Number(voucher.value) / 100));
  }
  if (voucher.type === "fixed") {
    rawDiscount = Number(voucher.value);
  }
  const maxDiscount =
    voucher.max_discount_amount === null || voucher.max_discount_amount === undefined
      ? rawDiscount
      : Math.min(rawDiscount, Number(voucher.max_discount_amount));

  return Math.min(Math.max(maxDiscount, 0), Number(subtotal));
};

const markVoucherUsed = async (discountCode, transaction) => {
  const code = normalizeCode(discountCode);
  if (!code) return;

  await Voucher.increment("used_count", {
    by: 1,
    where: { code },
    transaction,
  });
};

module.exports = {
  ensureDefaultVouchers,
  getAllVouchers,
  getActiveVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  calculateDiscount,
  markVoucherUsed,
};
