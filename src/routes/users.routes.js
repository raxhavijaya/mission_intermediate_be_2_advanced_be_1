// routes/users.routes.js
const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/users.controller");
const Joi = require("joi");
const { validateBody } = require("../middlewares/validate");

// === SCHEMAS ===
const registerSchema = Joi.object({
  fullname: Joi.string().min(2).required(),
  username: Joi.string().alphanum().min(3).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// === ROUTES ===
router.post("/register", validateBody(registerSchema), usersCtrl.register);
router.post("/login", validateBody(loginSchema), usersCtrl.login);

// ✅ VERIFY EMAIL (public): GET /api/v1/users/verify-email?token=...
router.get("/verify-email", usersCtrl.verifyEmail);

module.exports = router;
