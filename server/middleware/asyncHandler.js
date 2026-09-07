// =========================
// ASYNC HANDLER
// =========================
// Wraps an async route so a rejected promise reaches the error middleware
// instead of hanging the request.

const asyncHandler = (handler) => (request, response, next) =>
  Promise.resolve(handler(request, response, next)).catch(next);

module.exports = asyncHandler;
