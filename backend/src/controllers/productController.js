const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/productService");

const buildImagePath = (req) =>
  req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : undefined;

const getProducts = asyncHandler(async (req, res) => {
  const data = await productService.getAllProducts(req.query);
  res.json(data);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct({
    ...req.body,
    image: buildImagePath(req),
  });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const image = buildImagePath(req);
  const product = await productService.updateProduct(req.params.id, {
    ...req.body,
    ...(image ? { image } : {}),
  });
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ message: "Product deleted successfully" });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

