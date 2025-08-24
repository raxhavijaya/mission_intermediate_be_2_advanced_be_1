const express = require("express");
const router = express.Router();
const moviesCtrl = require("../controllers/movies.controller");
const { validateBody } = require("../middlewares/validate");
const { verifyToken } = require("../middlewares/auth");
const Joi = require("joi");

// Schemas
const baseFields = {
  title: Joi.string().min(2),
  release_year: Joi.number().integer().min(1880).max(2999),
  genre: Joi.string().allow(null, ""),
  synopsis: Joi.string().allow(null, ""),
  rating: Joi.number().min(0).max(10).allow(null), // 0..10
  duration_min: Joi.number().integer().min(1).allow(null),
  poster_url: Joi.string().uri().allow(null, ""),
};

// POST (create) 
const createSchema = Joi.object({
  ...baseFields,
  title: baseFields.title.required(),
});

// PUT (replace)
const putSchema = Joi.object({
  ...baseFields,
  title: baseFields.title.required(),
  release_year: baseFields.release_year.required(),
});

// PATCH (partial) 
const patchSchema = Joi.object(baseFields).min(1);

// GET all movies (public) + query params
router.get("/", async (req, res, next) => {
  try {
    const data = await moviesCtrl.getMovies(req.query);
    res.json({ status: "success", data });
  } catch (e) {
    next(e);
  }
});

// GET by ID (protected)
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const data = await moviesCtrl.getMovieById(req.params.id);
    res.json({ status: "success", data });
  } catch (e) {
    next(e);
  }
});

// CREATE (protected)
router.post(
  "/",
  verifyToken,
  validateBody(createSchema),
  async (req, res, next) => {
    try {
      const data = await moviesCtrl.createMovie(req.body);
      res.status(201).json({ status: "success", data });
    } catch (e) {
      next(e);
    }
  }
);

// REPLACE (protected)
router.put(
  "/:id",
  verifyToken,
  validateBody(putSchema),
  async (req, res, next) => {
    try {
      const data = await moviesCtrl.replaceMovie(req.params.id, req.body);
      res.json({ status: "success", data });
    } catch (e) {
      next(e);
    }
  }
);

// PATCH (protected)
router.patch(
  "/:id",
  verifyToken,
  validateBody(patchSchema),
  async (req, res, next) => {
    try {
      const data = await moviesCtrl.updateMovie(req.params.id, req.body);
      res.json({ status: "success", data });
    } catch (e) {
      next(e);
    }
  }
);

// DELETE (protected)
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const result = await moviesCtrl.deleteMovie(req.params.id);
    res.status(200).json({ status: "success deleted", data: result });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
