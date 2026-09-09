// =========================
// DATABASE CONNECTION
// =========================

const mongoose = require("mongoose");

// The POS keeps a local cache in the browser, so the server stays up even when
// MongoDB is unreachable. Routes check isConnected() and answer 503 instead of
// hanging on a query that can never complete.

let connected = false;

// =========================
// CONNECTION EVENTS
// =========================

mongoose.connection.on("connected", () => {
  connected = true;
});

mongoose.connection.on("disconnected", () => {
  connected = false;
});

// =========================
// CHECK CONNECTION
// =========================

const isConnected = () => {
  return connected && mongoose.connection.readyState === 1;
};

// =========================
// CONNECT DATABASE
// =========================

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env first.");
  }

  // If MongoDB is already connected, don't create another connection.
  if (mongoose.connection.readyState === 1) {
    connected = true;

    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    connected = true;

    return mongoose.connection;
  } catch (error) {
    connected = false;

    console.error("MongoDB connection error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      reason: error.reason?.message,
    });

    throw error;
  }
};

// =========================
// EXPORTS
// =========================

module.exports = {
  connectDatabase,
  isConnected,
};
