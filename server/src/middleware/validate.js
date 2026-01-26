const { validationResult } = require("express-validator");
const { AppError } = require("../utils/AppError");

function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // 👇 ADD THIS LINE HERE:
    console.log(
      "❌ Validation Error Details:",
      JSON.stringify(result.array(), null, 2),
    );

    return next(
      new AppError("Validation failed", 400, "VALIDATION_ERROR", {
        errors: result.array(),
      }),
    );
  }
  next();
}

module.exports = { validate };
