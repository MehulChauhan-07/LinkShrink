const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    // Only show error details in development
    error: process.env.NODE_ENV === "production" ? null : err.message,
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    message: "Not Found",
  });
}

module.exports = {
  errorHandler,
  notFound,
};