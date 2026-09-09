// =========================
// FAVOUR STORE POS SERVER
// =========================

require("dotenv").config();

const path = require("path");

const express = require("express");
const cors = require("cors");

const { connectDatabase, isConnected } = require("./config/db");
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
// DATABASE
// =========================

let databaseReady = false;
let databaseInitializing = null;

const initializeDatabase = async () => {
  // If we think the database is ready, make sure MongoDB
  // is actually still connected before skipping initialization.
  if (databaseReady && isConnected()) {
    return true;
  }

  // If the connection was lost, allow initialization to run again.
  if (!isConnected()) {
    databaseReady = false;
  }

  if (databaseInitializing) {
    return databaseInitializing;
  }

  databaseInitializing = (async () => {
    try {
      await connectDatabase();

      console.log("MongoDB connected.");

      try {
        await Promise.all([
          Product.syncIndexes(),
          Sale.syncIndexes(),
          Setting.syncIndexes(),
        ]);
      } catch (error) {
        console.error("Index build failed:", error.message);
        console.error(
          "Duplicate barcodes may not be rejected by the database.",
        );
      }

      const seeded = await seedDefaultProducts();

      if (seeded > 0) {
        console.log(`Seeded ${seeded} default products.`);
      }

      databaseReady = true;

      return true;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);

      databaseReady = false;

      return false;
    } finally {
      databaseInitializing = null;
    }
  })();

  return databaseInitializing;
};

// =========================
// VERCEL DATABASE INITIALIZATION
// =========================

// This must come BEFORE the API routes.
// Vercel initializes the database before handling API requests.

app.use(async (request, response, next) => {
  if (request.path.startsWith("/api")) {
    await initializeDatabase();
  }

  next();
});

// =========================
// API
// =========================

app.use("/api", apiRoutes);

app.use("/api", notFound);

// =========================
// FRONT END
// =========================

app.use(express.static(PUBLIC_DIR));

// The barcode scanner library ships with the project's dependencies,
// so the POS does not need internet access to scan.

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
// LOCAL SERVER
// =========================

const start = async () => {
  await initializeDatabase();

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

// =========================
// VERCEL
// =========================

// Vercel imports the Express app instead of starting app.listen().
module.exports = app;

// Only start the local server when this file is run directly.
if (require.main === module) {
  start();
}
