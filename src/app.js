require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const path = require("path");
const fs = require("fs");

app.use(express.json());
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(path.resolve(uploadDir)));

app.use("/api/v1", routes);
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
