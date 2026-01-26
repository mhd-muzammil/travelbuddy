function ok(res, message, data) {
  return res.status(200).json({ success: true, message, data, error: null });
}

function created(res, message, data) {
  return res.status(201).json({ success: true, message, data, error: null });
}

function fail(res, status, message, error) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    error: typeof error === "string" ? { message: error } : error || { message },
  });
}

module.exports = { ok, created, fail };

