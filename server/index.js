// =========================
// FAVOUR STORE POS SERVER
// =========================

require("dotenv").config();

const path = require("path");

const express = require("express");
const cors = require("cors");

const { connectDatabase } = require("./config/db");
const { seedDefaultProducts } = require("./config/seed");
const Product = require("./models/Product");
const Sale = require("./models/Sale");
const Setting = require("./models/Setting");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const PUBLIC_DIR = path.join(__dirname, "..", "public");

// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json({ limit: "1mb" }));

// =========================
// API
// =========================

app.use("/api", apiRoutes);

app.use("/api", notFound);

// =========================
// FRONT END
// =========================

app.use(express.static(PUBLIC_DIR));

// The barcode scanner library ships with the project's dependencies, so the
// POS does not need internet access to scan.
app.use(
  "/vendor/zxing",
  express.static(
    path.join(__dirname, "..", "node_modules", "@zxing", "browser", "umd"),
  ),
);

app.get("/pos", (request, response) => {
  response.sendFile(path.join(PUBLIC_DIR, "pos.html"));
});

// =========================
// ERRORS
// =========================

app.use(errorHandler);

// =========================
// START
// =========================

const start = async () => {
  try {
    await connectDatabase();

    console.log("MongoDB connected.");

    // Mongoose builds indexes in the background and swallows failures, which
    // would leave the unique barcode index silently missing.
    try {
      await Promise.all([
        Product.syncIndexes(),
        Sale.syncIndexes(),
        Setting.syncIndexes(),
      ]);
    } catch (error) {
      console.error("Index build failed:", error.message);
      console.error("Duplicate barcodes may not be rejected by the database.");
    }

    const seeded = await seedDefaultProducts();

    if (seeded > 0) {
      console.log(`Seeded ${seeded} default products.`);
    }
  } catch (error) {
    // The POS falls back to its browser cache, so a database outage should not
    // stop the storefront from loading.
    console.error("MongoDB connection failed:", error.message);
    console.error("Serving the POS without the API until the database is up.");
  }

  const server = app.listen(PORT, () => {
    console.log(`Favour Store POS running on http://localhost:${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Set PORT in .env to a free port.`,
      );

      process.exit(1);
    }

    throw error;
  });
};

start();
