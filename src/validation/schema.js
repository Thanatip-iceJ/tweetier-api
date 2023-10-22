const { required } = require("joi");
const Joi = require("joi");

exports.registerSchema = Joi.object({
  firstName: Joi.string().trim().required().max(30),
  lastName: Joi.string().trim().required().max(30),
  email: Joi.string().email(),
  username: Joi.string().trim().required().max(16),
  password: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .trim()
    .required()
    .strip(),
});

exports.loginSchema = Joi.object({
  emailOrUsername: Joi.alternatives([
    Joi.string().email().required(),
    Joi.string().trim().required().max(16).required(),
  ]),
  password: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

exports.userIdSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
});

exports.postIdSchema = Joi.object({
  postId: Joi.number().integer().positive().required(),
});

exports.commentIdSchema = Joi.object({
  commentId: Joi.number().integer().positive().required(),
});
