const prisma = require("../models/prisma");

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
