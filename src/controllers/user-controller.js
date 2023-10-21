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

const followerIds = async (profileId) => {
  try {
    const relationship = await prisma.userRelationship.findMany({
      where: {
        followedUserId: profileId,
      },
    });
    const followers = relationship.map((x) => x.followedByUserId);
    return followers;
  } catch (err) {
    console.log(err);
  }
};

const followingIds = async (profileId) => {
  try {
    const relationship = await prisma.userRelationship.findMany({
      where: {
        followedByUserId: profileId,
      },
    });
    const followings = relationship.map((x) => x.followedUserId);
    return followings;
  } catch (err) {
    console.log(err);
  }
};

exports.getUsers = async (req, res, next) => {
  const followings = await followingIds(req.user.id);
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: {
            in: [...followings, req.user.id],
          },
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
    const value = JSON.parse(req.body.info);
    console.log(value);
    console.log(req.files.coverImg);
    console.log(req.files.profileImg);

    const response = {};

    console.log(req.files);
    if (req.files.profileImg) {
      console.log(req.files);
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
    if (req.files.coverImg) {
      const url = await upload(req.files.coverImg[0].path);
      response.coverImg = url;
      await prisma.user.update({
        data: {
          coverImg: url,
        },
        where: {
          id: req.user.id,
        },
      });
    }

    if (value) {
      response.info = value;
      await prisma.user.update({
        data: {
          firstName: value.firstName,
          lastName: value.lastName,
          bio: value.bio,
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
    if (req.files.coverImg) {
      fs.unlink(req.files.coverImg[0].path);
    }
  }
};

exports.getFollows = async (req, res, next) => {
  try {
    const { error, value } = userIdSchema.validate(req.params);
    if (error) {
      next(error);
      return;
    }
    const followers = await followerIds(value.userId);
    const followings = await followingIds(value.userId);
    console.log("followers", followers);
    console.log("followings", followings);
    res.status(200).json({ followers, followings });
  } catch (err) {
    next(err);
  }
};
