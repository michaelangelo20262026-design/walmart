// =========================
// DEFAULT PRODUCTS
// =========================
// Only runs when the products collection is empty, so it never overwrites a
// real store's inventory.

const Product = require("../models/Product");

const defaultProducts = [
  { name: "Peak Milk", price: 5500, barcode: "123456789001", category: "Food", stock: 50 },
  { name: "Indomie Noodles", price: 800, barcode: "123456789002", category: "Food", stock: 50 },
  { name: "Coca-Cola", price: 1200, barcode: "123456789003", category: "Drinks", stock: 50 },
  { name: "Milo", price: 4500, barcode: "123456789004", category: "Food", stock: 50 },
  { name: "Dettol", price: 2500, barcode: "123456789005", category: "Toiletries", stock: 50 },
  { name: "Tissue Paper", price: 1800, barcode: "123456789006", category: "Household", stock: 50 },
];

const seedDefaultProducts = async () => {
  if (String(process.env.SEED_DEFAULT_PRODUCTS).toLowerCase() === "false") {
    return 0;
  }

  const count = await Product.estimatedDocumentCount();

  if (count > 0) {
    return 0;
  }

  await Product.insertMany(defaultProducts);

  return defaultProducts.length;
};

module.exports = { seedDefaultProducts, defaultProducts };
