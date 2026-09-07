// =========================
// ERROR HANDLING
// =========================

const notFound = (request, response) => {
  response.status(404).json({ message: `No API route for ${request.originalUrl}` });
};

const errorHandler = (error, request, response, next) => {
  // Mongoose schema validation.
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((field) => field.message)
      .join(" ");

    return response.status(400).json({ message: message });
  }

  // Duplicate key — in practice a barcode or receipt number already in use.
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "value";

    const label = field === "barcode" ? "barcode" : field;

    return response
      .status(409)
      .json({ message: `A record with this ${label} already exists.` });
  }

  // Malformed ObjectId in the URL.
  if (error.name === "CastError") {
    return response.status(400).json({ message: `Invalid ${error.path}.` });
  }

  console.error("API error:", error);

  response.status(error.status || 500).json({
    message: error.message || "Something went wrong on the server.",
  });
};

module.exports = { notFound, errorHandler };
