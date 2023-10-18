const prisma = require("../models/prisma");
const { postIdSchema } = require("../validation/schema");

const getFollowingIds = async (authId) => {
  const relationship = await prisma.userRelationship.findMany({
    where: {
      followedByUserId: authId,
    },
  });
  const followingIds = relationship.map((x) => x.followedUserId);
  return followingIds;
};

exports.createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(req.body);
    // console.log(userId);
    const { message } = req.body;
    // console.log(body);
    await prisma.post.create({
      data: {
        contentText: message,
        userId: userId,
      },
    });
    res.status(200).json({ message: "Posted successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const followingIds = await getFollowingIds(req.user.id);
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: [...followingIds, req.user.id],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profileImg: true,
          },
        },
      },
    });
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { error, value } = postIdSchema.validate(req.params);
    console.log(value);
    if (error) {
      next(error);
      return;
    }
    const post = await prisma.post.findFirst({
      where: {
        id: value.postId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profileImg: true,
          },
        },
      },
    });
    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getPostByUserId = async (req, res, next) => {
  const { userId } = req.params;
  const posts = await prisma.post.findMany({
    where: {
      userId: +userId,
    },
  });
  res.status(200).json(posts);
};
