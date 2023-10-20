const path = require("path");
const prisma = require("../models/prisma");
const { postIdSchema } = require("../validation/schema");
const fs = require("fs/promises");

const getFollowingIds = async (authId) => {
  const relationship = await prisma.userRelationship.findMany({
    where: {
      followedByUserId: authId,
    },
  });
  const followingIds = relationship.map((x) => x.followedUserId);
  return followingIds;
};

const getLikesByPostId = async (postId) => {
  try {
    const likes = await prisma.postlike.findMany({
      where: {
        postId: postId,
      },
    });
    return likes;
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // console.log(req.body);
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
        PostLikes: true,
        Comments: true,
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
    // console.log(value);
    if (error) {
      next(error);
      return;
    }
    const post = await prisma.post.findFirst({
      where: {
        id: value.postId,
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

exports.createLike = async (req, res, next) => {
  const response = {};
  try {
    const { error, value } = postIdSchema.validate(req.params);
    if (error) {
      next(error);
    }
    const liked = await prisma.postLike.findFirst({
      where: {
        postId: value.postId,
        likedById: req.user.id,
      },
    });
    if (!liked) {
      await prisma.postLike.create({
        data: {
          postId: value.postId,
          likedById: req.user.id,
        },
      });
      response.message = "Liked";
    }

    if (liked) {
      await prisma.postLike.delete({
        where: {
          id: liked.id,
        },
      });
      response.message = "Unliked";
    }
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { error, value } = postIdSchema.validate(req.params);
    if (error) {
      next(error);
      return;
    }
    await prisma.post.delete({
      where: {
        id: value.postId,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    console.log(req.body);
    const { error, value } = postIdSchema.validate(req.params);
    if (error) {
      next(error);
      return;
    }
    await prisma.comment.create({
      data: {
        contentText: req.body.message,
        postId: value.postId,
        commentedById: req.user.id,
      },
    });
    res.status(201).json({ message: "Comment created" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const { error, value } = postIdSchema.validate(req.params);
    if (error) {
      next(error);
      return;
    }
    const comments = await prisma.comment.findMany({
      where: {
        postId: value.postId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profileImg: true,
            createdAt: true,
          },
        },
      },
    });
    console.log(comments);

    res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
