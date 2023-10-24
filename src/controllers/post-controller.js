const path = require("path");
const prisma = require("../models/prisma");
const { postIdSchema, commentIdSchema } = require("../validation/schema");
const { upload } = require("../utils/cloudinary-upload");
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
    console.log(req.file);
    const message = JSON.parse(req.body.text);
    const data = { userId: req.user.id };
    if (req.file) {
      data.contentImg = await upload(req.file.path);
    }
    if (message) {
      data.contentText = message;
    }

    const post = await prisma.post.create({
      data: data,
      include: {
        user: true,
        Comments: true,
        PostLikes: true,
      },
    });
    console.log(post);

    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    next(err);
  } finally {
    if (req.file) {
      fs.unlink(req.file.path);
    }
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
    console.log(value);
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
        PostLikes: true,
        Comments: true,
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
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      PostLikes: true,
      Comments: true,
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
    const isExist = await prisma.post.findFirst({
      where: {
        id: value.postId,
      },
    });
    if (isExist) {
      await prisma.post.delete({
        where: {
          id: isExist.id,
        },
      });
    }
    res.status(200).json({ message: "delete laew i sus" });
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
    const comment = await prisma.comment.create({
      data: {
        contentText: req.body.commentText,
        postId: value.postId,
        commentedById: req.user.id,
      },
      include: {
        user: true,
      },
    });
    res.status(201).json(comment);
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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });
    console.log(comments);

    res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { error, value } = commentIdSchema.validate(req.params);
    if (error) {
      next(error);
      return;
    }
    const isExist = await prisma.comment.findFirst({
      where: {
        id: value.commentId,
      },
    });
    if (isExist) {
      await prisma.comment.delete({
        where: {
          id: isExist.id,
        },
      });
    }
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getLikes = async (req, res, next) => {
  try {
    const { err, value } = postIdSchema.validate(req.params);
    if (err) {
      next(err);
      return;
    }
    const likes = await prisma.postLike.findMany({
      where: {
        postId: value.postId,
      },
    });
    res.status(200).json(likes);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
