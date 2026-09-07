// =========================
// DATABASE GUARD
// =========================
// The static site is still served when MongoDB is down; the API is not.

const { isConnected } = require("../config/db");

const requireDatabase = (request, response, next) => {
  if (!isConnected()) {
    return response.status(503).json({
      message:
        "Database unavailable. The POS is running on its local cache — check MONGODB_URI.",
    });
  }

  next();
};

module.exports = requireDatabase;
