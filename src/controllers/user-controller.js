const prisma = require("../models/prisma");

const createError = require("../utils/create-error");
const { userIdSchema } = require("../validation/schema");

const statusWithAuthUser = async (targetId, authId) => {
  if (targetId === authId) {
    return "AUTH";
  }
  const followedByAuth = await prisma.userRelationship.findFirst({
    where: {
      AND: [{ followedByUserId: authId }, { followedUserId: targetId }],
    },
  });
  if (followedByAuth) {
    return "FOLLOWED";
  }

  return "UNKNOWN";
};

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
    const statusWithAuth = await statusWithAuthUser(value.userId, req.user.id);

    delete user.password;
    res.status(200).json({ user, statusWithAuth });
  } catch (err) {
    next(err);
  }
};
