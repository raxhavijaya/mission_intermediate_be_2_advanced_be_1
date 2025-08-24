// middlewares/errorHandler.js
const multer = require("multer");

module.exports = (err, req, res, next) => {
  // kalau header sudah terkirim, lempar ke default handler
  if (res.headersSent) return next(err);

  const env = process.env.NODE_ENV || "development";

  // == Multer errors (upload) ==
  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: "File too large",
      LIMIT_UNEXPECTED_FILE: "Unexpected field",
      LIMIT_FILE_COUNT: "Too many files",
      LIMIT_PART_COUNT: "Too many parts",
      LIMIT_FIELD_KEY: "Field name too long",
      LIMIT_FIELD_VALUE: "Field value too long",
      LIMIT_FIELD_COUNT: "Too many fields",
    };
    return res.status(400).json({
      status: "error",
      message: map[err.code] || err.message,
    });
  }

  // == File filter custom (bukan image) ==
  if (err && err.message === "Only image files are allowed") {
    return res.status(err.status || 415).json({
      status: "error",
      message: err.message,
    });
  }

  // == Body JSON rusak ==
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON payload",
    });
  }

  // == Duplikat key MySQL (jaga-jaga selain yang sudah kamu tangani manual) ==
  if (err && err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      status: "error",
      message: "Duplicate entry",
    });
  }

  // == Default ==
  const status = err.status || 500;
  const payload = {
    status: "error",
    message: err.message || "Internal Server Error",
  };

  if (env !== "production" && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
};
