// =========================
// API ROUTES
// =========================

const express = require("express");

const requireDatabase = require("../middleware/requireDatabase");
const { isConnected } = require("../config/db");

const productRoutes = require("./productRoutes");
const saleRoutes = require("./saleRoutes");
const settingRoutes = require("./settingRoutes");

const router = express.Router();

// The front end calls this on start-up to decide between the API and its
// local cache, so it must answer even while the database is down.
router.get("/health", (request, response) => {
  response.json({
    status: "ok",
    database: isConnected() ? "connected" : "disconnected",
  });
});

router.use("/products", requireDatabase, productRoutes);

router.use("/sales", requireDatabase, saleRoutes);

router.use("/settings", requireDatabase, settingRoutes);

module.exports = router;
