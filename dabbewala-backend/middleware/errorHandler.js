// Global error handler middleware
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  // Basic structured log to console for now
  console.error(err);
  res.status(statusCode).json({ success: false, message: err.message || "Server Error" });
};
