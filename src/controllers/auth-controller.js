const bcrypt = require("bcryptjs");
const prisma = require("../models/prisma");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const { registerSchema, loginSchema } = require("../validation/schema");
const createError = require("../utils/create-error");

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log(error);
      next(error);
      return;
    }

    value.password = await bcrypt.hash(value.password, 12);

    const user = await prisma.user.create({
      data: value,
    });

    const payload = { userId: user.id };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "welcome mfk",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    delete user.password;

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      next(error);
      return;
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: value.emailOrUsername },
          { username: value.emailOrUsername },
        ],
      },
    });

    if (!user) {
      next(createError("Invalid username or password", 400));
      return;
    }
    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      next(createError("Invalid username or password", 400));
      return;
    }

    const payload = { userId: user.id };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "asdasdasdadaasdadasd",
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );
    delete user.password;

    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
};

exports.getAuth = (req, res, next) => {
  res.status(200).json({ user: req.user });
};
