// =========================
// SALE CONTROLLER
// =========================

const mongoose = require("mongoose");

const Sale = require("../models/Sale");
const Product = require("../models/Product");

// -------------------------
// GET /api/sales
// -------------------------

const listSales = async (request, response) => {
  const limit = Number(request.query.limit);

  const query = Sale.find().sort({ date: 1 });

  if (Number.isInteger(limit) && limit > 0) {
    query.limit(limit);
  }

  const sales = await query;

  response.json(sales);
};

// -------------------------
// POST /api/sales
// -------------------------
// Records the sale and takes the sold quantities out of stock, so the browser
// never has to be trusted with inventory maths.

const createSale = async (request, response) => {
  const body = request.body || {};

  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (rawItems.length === 0) {
    return response
      .status(400)
      .json({ message: "A sale must contain at least one item." });
  }

  const items = rawItems.map((item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    return {
      // Manual items carry ids like "manual-1736…" — those are not products.
      productId: mongoose.isValidObjectId(item.productId ?? item.id)
        ? item.productId ?? item.id
        : null,

      name: String(item.name ?? "").trim(),
      price: price,
      quantity: quantity,
      total: price * quantity,
    };
  });

  const invalidItem = items.find(
    (item) =>
      item.name === "" ||
      !Number.isFinite(item.price) ||
      item.price < 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1,
  );

  if (invalidItem) {
    return response
      .status(400)
      .json({ message: `Invalid sale item: ${invalidItem.name || "unnamed"}.` });
  }

  // Totals are recomputed here rather than taken from the request.
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const discount = Math.max(0, Number(body.discount) || 0);

  const receiptNo =
    String(body.receiptNo ?? "").trim() || `FS-${Date.now()}`;

  const date = body.date ? new Date(body.date) : new Date();

  const sale = await Sale.create({
    receiptNo: receiptNo,
    date: Number.isNaN(date.valueOf()) ? new Date() : date,
    dateTime: String(body.dateTime ?? "").trim(),
    items: items,
    subtotal: subtotal,
    discount: discount,
    total: Math.max(0, subtotal - discount),
  });

  const updatedProducts = await reduceStock(items);

  response.status(201).json({ sale: sale, products: updatedProducts });
};

// -------------------------
// STOCK REDUCTION
// -------------------------
// Stock never goes below zero, and products sold as manual items are skipped.

const reduceStock = async (items) => {
  const sold = new Map();

  items.forEach((item) => {
    if (!item.productId) {
      return;
    }

    const key = String(item.productId);

    sold.set(key, (sold.get(key) || 0) + item.quantity);
  });

  if (sold.size === 0) {
    return [];
  }

  const products = await Product.find({ _id: { $in: [...sold.keys()] } });

  const writes = products.map((product) => ({
    updateOne: {
      filter: { _id: product._id },
      update: {
        $set: {
          stock: Math.max(0, product.stock - sold.get(String(product._id))),
        },
      },
    },
  }));

  if (writes.length > 0) {
    await Product.bulkWrite(writes);
  }

  return Product.find({ _id: { $in: [...sold.keys()] } });
};

// -------------------------
// DELETE /api/sales
// -------------------------

const clearSales = async (request, response) => {
  const result = await Sale.deleteMany({});

  response.json({
    message: "Sales history cleared.",
    deleted: result.deletedCount,
  });
};

module.exports = { listSales, createSale, clearSales };
