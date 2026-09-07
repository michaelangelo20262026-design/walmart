// =========================
// STORE SETTINGS ROUTES
// =========================

const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingController");

const router = express.Router();

router.get("/", asyncHandler(getSettings));

router.put("/", asyncHandler(updateSettings));

module.exports = router;
