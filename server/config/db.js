// =========================
// DATABASE CONNECTION
// =========================

const mongoose = require("mongoose");

// The POS keeps a local cache in the browser, so the server stays up even when
// MongoDB is unreachable. Routes check isConnected() and answer 503 instead of
// hanging on a query that can never complete.

let connected = false;

const isConnected = () => connected && mongoose.connection.readyState === 1;

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env first.");
  }

  mongoose.connection.on("connected", () => {
    connected = true;
  });

  mongoose.connection.on("disconnected", () => {
    connected = false;
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  connected = true;

  return mongoose.connection;
};

module.exports = { connectDatabase, isConnected };
