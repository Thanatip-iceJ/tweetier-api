const prisma = require("../models/prisma");
const { upload } = require("../utils/cloudinary-upload");
const fs = require("fs/promises");

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

exports.editProfile = async (req, res, next) => {
  try {
    const response = {};

    if (req.files.profileImg) {
      console.log(req.files.profileImg);
      const url = await upload(req.files.profileImg[0].path);
      response.profileImg = url;
      await prisma.user.update({
        data: {
          profileImg: url,
        },
        where: {
          id: req.user.id,
        },
      });
    }

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    next(err);
  } finally {
    if (req.files.profileImg) {
      fs.unlink(req.files.profileImg[0].path);
    }
  }
};
