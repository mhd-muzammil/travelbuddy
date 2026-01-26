const { fail } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");

function notFound(req, res) {
  return fail(res, 404, "Route not found", { code: "NOT_FOUND" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Server error";
  const code = err?.code || (err instanceof AppError ? err.code : "SERVER_ERROR");

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  return fail(res, status, message, {
    code,
    details: err?.details,
  });
}

module.exports = { notFound, errorHandler };

