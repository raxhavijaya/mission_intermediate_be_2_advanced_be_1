const express = require("express");
const router = express.Router();
const moviesCtrl = require("../controllers/movies.controller");
const { validateBody } = require("../middlewares/validate");
const Joi = require("joi");

// Schemas
const movieSchema = Joi.object({
  title: Joi.string().min(2).required(),
  year: Joi.number().integer().min(1880).required(),
  genre: Joi.string().optional(),
});
const partialSchema = Joi.object({
  title: Joi.string().min(2).optional(),
  year: Joi.number().integer().min(1880).optional(),
  genre: Joi.string().optional(),
}).min(1);

// Routes
router.get("/", async (req, res, next) => {
  try {
    const data = await moviesCtrl.getMovies();
    res.json({ status: "success", data });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = await moviesCtrl.getMovieById(req.params.id);
    res.json({ status: "success", data });
  } catch (e) {
    next(e);
  }
});

router.post("/", validateBody(movieSchema), async (req, res, next) => {
  try {
    const data = await moviesCtrl.createMovie(req.body);
    res.status(201).json({ status: "success", data });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", validateBody(movieSchema), async (req, res, next) => {
  try {
    const data = await moviesCtrl.replaceMovie(req.params.id, req.body);
    res.json({ status: "success", data });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", validateBody(partialSchema), async (req, res, next) => {
  try {
    const data = await moviesCtrl.updateMovie(req.params.id, req.body);
    res.json({ status: "success", data });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await moviesCtrl.deleteMovie(req.params.id);
    res.status(200).json({
      status: "success deleted",
      data: result,
    });
  } catch (e) {
    next(e);
  }
});


module.exports = router;
