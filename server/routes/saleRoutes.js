// =========================
// SALE ROUTES
// =========================

const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");

const {
  listSales,
  createSale,
  clearSales,
} = require("../controllers/saleController");

const router = express.Router();

router.get("/", asyncHandler(listSales));

router.post("/", asyncHandler(createSale));

router.delete("/", asyncHandler(clearSales));

module.exports = router;
