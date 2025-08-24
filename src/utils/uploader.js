const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const uploadDir = process.env.UPLOAD_DIR || "uploads";
const maxMB = Number(process.env.MAX_UPLOAD_MB || 2); // default 2 MB
const maxBytes = Math.max(1, maxMB) * 1024 * 1024;

// ensure folder exists
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
function fileFilter(req, file, cb) {
  if (allowed.has(file.mimetype)) return cb(null, true);
  const err = new Error("Only image files are allowed");
  err.status = 415;
  cb(err, false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxBytes, files: 1 },
});

module.exports = {
  uploadSingle: (field = "file") => upload.single(field),
  uploadArray: (field = "files", maxCount = 5) => upload.array(field, maxCount),
  uploadDir,
};
