const bcrypt = require("bcryptjs");
const { registerSchema } = require("../validation/schema");
const prisma = require("../models/prisma");
require("dotenv").config();
const jwt = require("jsonwebtoken");

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
