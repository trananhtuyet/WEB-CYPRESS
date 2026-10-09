const { Op, literal } = require("sequelize");
const { sequelize, CartItem, Category, OrderItem, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const { getPagination } = require("../utils/pagination");

const CURATED_CATEGORY_ORDERS = {
  "Váy": [
    "D.CHIC Chân Váy Bút Chì Xẻ Trước Tinh Tế",
    "IVY moda Chân Váy Chữ A Đính Cúc Sang Trọng",
    "Rechic Chân Váy Lụa Satin Bóng Mịn",
    "Uniqlo Chân Váy Xếp Ly Dáng Dài",
    "Levis Chân Váy Jean Decon Iconic",
    "Gumac Chân Váy Bút Chì Phối Đai Thanh Lịch",
    "NEM Fashion Chân Váy Dạ Tweed Phối Viền Tiểu Thư",
    "Zara Chân Váy Midi Xếp Ly Ánh Kim",
    "Canifa Chân Váy Khaki Dáng Chữ A Cơ Bản",
    "Twenty.five Chân Váy Jean Xẻ Tà Giữa Cá Tính",
  ],
  "Túi Xách": [
    "Charles & Keith Túi Đeo Chéo Nắp Gập Khóa Kim Loại",
    "Pedro Studio Leather Túi Xách Tay Da Thật",
    "Vascara Clutch Dự Tiệc Đính Đá",
    "Aldo Túi Xách Tay Dáng Hộp Thời Thượng",
    "Floralpunk Túi Kẹp Nách Đính Ngọc Trai",
    "Juno Túi Xách Tay Cỡ Vừa Phối Màu Hiện Đại",
    "Sabina Túi Tote Da Mềm Dáng Lớn",
    "NEM Fashion Túi Da Vân Nổi Công Sở",
    "Coolmate Túi Canvas Đa Năng",
    "Leonardo Cặp Da Công Sở Đựng Laptop",
    "Lather World Briefcase Da Thật Cao Cấp",
    "Gence Túi Clutch Nam Cầm Tay Sang Trọng",
  ],
  "Quần": [
    "Aristino Quần Âu Kaki Cao Cấp Công Sở",
    "Biluxury Quần Vải Nam Dáng Đứng Sang Trọng",
    "Adam Store Quần Âu May Đo Cao Cấp",
    "IVY moda Quần Baggy Nữ Công Sở",
    "Mango Quần Tây Ống Đứng Straight-Cut",
    "Gumac Quần Tây Nữ Ống Loe Nhẹ Hiện Đại",
    "Levis Quần Chinos XX Standard",
    "Libe Quần Jean Nữ Ống Suông Màu Cream",
    "Uniqlo Smart Pants Co Giãn 2 Chiều",
    "Calvin Klein Jeans Slim Fit Màu Tối",
    "Zara Quần Ống Rộng High-Waist",
    "Routine Quần Tây Nam Slimfit Hiện Đại",
    "D.CHIC Quần Suông Cạp Cao Tôn Dáng",
    "Coolmate Chinos Smart Pants Vải Tech",
  ],
  "Kính": [
    "Gentle Monster Lilit 01",
    "Ray-Ban Aviator Classic",
    "Oakley Holbrook",
    "Bolon Gọng Kính Mắt Mèo Thanh Lịch",
    "Prada Symbole Sunglasses",
    "Owndays Graph Belle",
    "Vigcom Gọng Kính Cận Acetate Cao Cấp",
    "Xiaomi Kính Chống Ánh Sáng Xanh Mijia",
  ],
  "Phụ Kiện": [
    "PNJ Lắc Tay Bạc Đính Đá Synthetic",
    "Doji Dây Chuyền Vàng Gắn Đá Quý",
    "Shimmer Silver Nhẫn Bạc Thủ Công Tối Giản",
    "Kaity Jewelry Khuyên Tai Nụ Đính Đá",
    "Bloom Jewelry Vòng Tay Charm Cá Tính",
    "Floralpunk Khuyên Tai Ngọc Trai Nhân Tạo",
    "Curnon Vòng Tay Cuff Kim Loại Thanh Mảnh",
    "The Little Owl Dây Chuyền Layer Nhiều Lớp",
    "Chiclala Khuyên Tai Dáng Dài Dự Tiệc",
    "Amuse Accessories Bộ Nhẫn Set Thời Trang",
    "H&M Kẹp Tóc Càng Cua Pastel",
    "Zara Bờm Tóc Đính Hạt",
    "Charles & Keith Khăn Lụa Thắt Nơ Đa Năng",
    "Méo Shop Cột Tóc Scrunchies Voan",
    "Nâu Accessories Trâm Cài Tóc Cổ Điển",
    "Casio Đồng Hồ Nữ Dây Kim Loại Vintage",
    "Daniel Wellington Đồng Hồ Mặt Tròn Classic",
    "Saga Đồng Hồ Dạng Lắc Tay Đính Đá",
    "Julius Đồng Hồ Nữ Dây Da Xanh Mint",
    "Tissot Lovely Square Cao Cấp",
  ],
};

const buildCuratedOrder = async (categoryId) => {
  if (!categoryId) {
    return [["created_at", "DESC"]];
  }

  const category = await Category.findByPk(categoryId);
  const curatedNames = category ? CURATED_CATEGORY_ORDERS[category.name] : null;

  if (!curatedNames?.length) {
    return [["created_at", "DESC"]];
  }

  const escapedNames = curatedNames.map((name) => `'${name.replace(/'/g, "\\'")}'`).join(", ");
  return [[literal(`FIELD(\`Product\`.\`name\`, ${escapedNames})`), "ASC"], ["id", "ASC"]];
};

const getAllProducts = async (query) => {
  const { page, limit, search, categoryId, minPrice, maxPrice } = query;
  const { offset, limit: pageSize, page: currentPage } = getPagination({ page, limit });

  const filters = {};
  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    const normalizedSearchLower = normalizedSearch.toLowerCase();
    const hasWhitespace = /\s/.test(normalizedSearchLower);
    const escapedSearch = sequelize.escape(`%${normalizedSearchLower}%`);
    const escapedWordSearch = sequelize.escape(`% ${normalizedSearchLower} %`);
    filters[Op.or] = [
      literal(
        hasWhitespace
          ? `LOWER(\`Product\`.\`name\`) COLLATE utf8mb4_bin LIKE ${escapedSearch}`
          : `CONCAT(' ', LOWER(\`Product\`.\`name\`), ' ') COLLATE utf8mb4_bin LIKE ${escapedWordSearch}`
      ),
      literal(
        hasWhitespace
          ? `LOWER(\`category\`.\`name\`) COLLATE utf8mb4_bin LIKE ${escapedSearch}`
          : `CONCAT(' ', LOWER(\`category\`.\`name\`), ' ') COLLATE utf8mb4_bin LIKE ${escapedWordSearch}`
      ),
    ];
  }
  if (categoryId) {
    filters.category_id = categoryId;
  }
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price[Op.gte] = Number(minPrice);
    if (maxPrice) filters.price[Op.lte] = Number(maxPrice);
  }

  const order = await buildCuratedOrder(categoryId);

  const { rows, count } = await Product.findAndCountAll({
    where: filters,
    include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
    distinct: true,
    order,
    offset,
    limit: pageSize,
  });

  return {
    products: rows,
    pagination: {
      page: currentPage,
      limit: pageSize,
      totalItems: count,
      totalPages: Math.ceil(count / pageSize) || 1,
    },
  };
};

const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
  });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

const validateProductPayload = (payload, { partial = false } = {}) => {
  const requiredFields = ["name", "price", "description", "stock", "category_id"];

  if (!partial) {
    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        throw new ApiError(400, `${field} is required`);
      }
    }
  }

  if (payload.price !== undefined && Number(payload.price) < 0) {
    throw new ApiError(400, "Product price must be greater than or equal to 0");
  }

  if (payload.stock !== undefined && Number(payload.stock) < 0) {
    throw new ApiError(400, "Product stock must be greater than or equal to 0");
  }
};

const createProduct = async (payload) => {
  validateProductPayload(payload);

  const category = await Category.findByPk(payload.category_id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const product = await Product.create(payload);
  return getProductById(product.id);
};

const updateProduct = async (id, payload) => {
  validateProductPayload(payload, { partial: true });

  const product = await Product.findByPk(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (payload.category_id) {
    const category = await Category.findByPk(payload.category_id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
  }

  await product.update(payload);
  return getProductById(product.id);
};

const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const [cartItemCount, orderItemCount] = await Promise.all([
    CartItem.count({ where: { product_id: id } }),
    OrderItem.count({ where: { product_id: id } }),
  ]);

  if (cartItemCount || orderItemCount) {
    throw new ApiError(409, "Cannot delete product because it is used in carts or orders");
  }

  await product.destroy();
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
