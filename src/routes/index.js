const express = require("express");
const router = express.Router();
const moviesRoutes = require("./movies.routes");

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

router.use("/movies", moviesRoutes);

module.exports = router;
