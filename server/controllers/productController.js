// =========================
// PRODUCT CONTROLLER
// =========================

const Product = require("../models/Product");

// Barcodes are stored as trimmed strings; "" means "no barcode".
const cleanBarcode = (value) => String(value ?? "").trim();

// A barcode may repeat only when it is absent. The unique partial index backs
// this up; the check here is what produces the readable message.
const barcodeTaken = async (barcode, exceptId = null) => {
  if (barcode === "") {
    return false;
  }

  const query = { barcode: barcode };

  if (exceptId) {
    query._id = { $ne: exceptId };
  }

  return Boolean(await Product.exists(query));
};

// -------------------------
// GET /api/products
// -------------------------

const listProducts = async (request, response) => {
  const products = await Product.find().sort({ createdAt: 1 });

  response.json(products);
};

// -------------------------
// POST /api/products
// -------------------------

const createProduct = async (request, response) => {
  const { name, price, barcode, category, stock } = request.body;

  const cleanedBarcode = cleanBarcode(barcode);

  if (await barcodeTaken(cleanedBarcode)) {
    return response
      .status(409)
      .json({ message: "A product with this barcode already exists." });
  }

  const product = await Product.create({
    name: String(name ?? "").trim(),
    price: Number(price),
    barcode: cleanedBarcode,
    category: category,
    stock: Number(stock),
  });

  response.status(201).json(product);
};

// -------------------------
// PUT /api/products/:id
// -------------------------

const updateProduct = async (request, response) => {
  const { name, price, barcode, category, stock } = request.body;

  const product = await Product.findById(request.params.id);

  if (!product) {
    return response.status(404).json({ message: "Product not found." });
  }

  if (barcode !== undefined) {
    const cleanedBarcode = cleanBarcode(barcode);

    if (await barcodeTaken(cleanedBarcode, product._id)) {
      return response
        .status(409)
        .json({ message: "A product with this barcode already exists." });
    }

    product.barcode = cleanedBarcode;
  }

  if (name !== undefined) product.name = String(name).trim();
  if (price !== undefined) product.price = Number(price);
  if (category !== undefined) product.category = category;
  if (stock !== undefined) product.stock = Number(stock);

  await product.save();

  response.json(product);
};

// -------------------------
// DELETE /api/products/:id
// -------------------------

const deleteProduct = async (request, response) => {
  const product = await Product.findByIdAndDelete(request.params.id);

  if (!product) {
    return response.status(404).json({ message: "Product not found." });
  }

  response.json({ message: "Product deleted.", id: request.params.id });
};

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
