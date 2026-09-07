// =========================
// PRODUCT ROUTES
// =========================

const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");

const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", asyncHandler(listProducts));

router.post("/", asyncHandler(createProduct));

router.put("/:id", asyncHandler(updateProduct));

router.delete("/:id", asyncHandler(deleteProduct));

module.exports = router;
