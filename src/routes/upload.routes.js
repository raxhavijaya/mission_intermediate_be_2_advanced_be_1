const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { uploadSingle } = require("../utils/uploader");

router.post("/", verifyToken, uploadSingle("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ status: "error", message: "No file uploaded" });
  }
  const file = req.file;
  const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
  res.json({
    status: "success",
    data: {
      filename: file.filename,
      url,
      mimetype: file.mimetype,
      size: file.size,
    },
  });
});

module.exports = router;
