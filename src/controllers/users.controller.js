const usersService = require("../services/users.services");

// === REGISTER ===
exports.register = async (req, res, next) => {
  try {
    const user = await usersService.register(req.body);
    res.status(201).json({
      status: "success",
      message: "Registration success. Please check your email to verify.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// === LOGIN ===
exports.login = async (req, res, next) => {
  try {
    const result = await usersService.login(req.body);
    res.json({
      status: "success",
      message: "Login success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// === VERIFY EMAIL ===
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body?.token;
    const result = await usersService.verifyEmail(token);
    res.json({
      status: "success",
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};
