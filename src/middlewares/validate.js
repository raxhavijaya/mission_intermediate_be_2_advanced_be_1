const Joi = require("joi");

exports.validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(", "));
      err.status = 400;
      return next(err);
    }
    req.body = value;
    next();
  };
};
