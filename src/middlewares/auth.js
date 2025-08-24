const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    // Ambil header Authorization
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    // Format: Bearer <token>
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token format",
      });
    }

    const token = parts[1];

    // Verifikasi token
    jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret",
      (err, decoded) => {
        if (err) {
          return res.status(401).json({
            status: "error",
            message: "Unauthorized: invalid or expired token",
          });
        }

        // simpan payload token ke req.user
        req.user = decoded;
        next();
      }
    );
  } catch (err) {
    next(err);
  }
};
