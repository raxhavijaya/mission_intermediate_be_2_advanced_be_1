const express = require("express");
const router = express.Router();
const moviesRoutes = require("./movies.routes");
const usersRoutes = require("./users.routes");
const uploadRoutes = require("./upload.routes");

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

router.use("/movies", moviesRoutes);
router.use("/users", usersRoutes); 
router.use("/upload", uploadRoutes);

module.exports = router;
