const prisma = require("../models/prisma");

const createError = require("../utils/create-error");
const { userIdSchema } = require("../validation/schema");

exports.getUsers = async (req, res, next) => {
  try {
    console.log(req.user);
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.user.id,
        },
      },
    });
    delete users.password;
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { error, value } = userIdSchema.validate(req.params);
    if (error) {
      next(error);
      return;
    }
    const user = await prisma.user.findUnique({
      where: {
        id: value.userId,
      },
    });
    delete user.password;
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
