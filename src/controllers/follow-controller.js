const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { statusWithAuth } = require("../controllers/user-controller");

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

exports.createFollow = async (req, res, next) => {
  try {
    const { targetId } = req.params;
    console.log(targetId);
    console.log(req.user.id);
    await prisma.userRelationship.create({
      data: {
        followedUserId: +targetId,
        followedByUserId: req.user.id,
      },
    });
    const statusWithAuth = statusWithAuthUser(+targetId, req.user.id);
    res.status(200).json({ statusWithAuth: statusWithAuth });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.unfollow = async (req, res, next) => {
  try {
    console.log(req.user.id);
    console.log(req.params);
    const { targetId } = req.params;
    const relationship = await prisma.userRelationship.findFirst({
      where: { followedByUserId: req.user.id, followedUserId: +targetId },
    });
    if (!relationship) {
      next(createError("relationship not found", 404));
      return;
    }
    await prisma.userRelationship.delete({
      where: {
        id: relationship.id,
      },
    });
    const statusWithAuth = statusWithAuthUser(+targetId, req.user.id);
    res.status(200).json({ statusWithAuth: statusWithAuth });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
