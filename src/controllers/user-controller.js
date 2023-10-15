const prisma = require("../models/prisma");

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
