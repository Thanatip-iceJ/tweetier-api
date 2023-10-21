const express = require("express");
const router = express.Router();

const userController = require("../controllers/user-controller");
const authenticate = require("../middlewares/authenticate");
const uploadMw = require("../middlewares/upload");

router.get("/getusers", authenticate, userController.getUsers);
router.get("/:userId", authenticate, userController.getUserById);
router.patch(
  "/profileedit",
  authenticate,
  uploadMw.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  userController.editProfile
);
router.get("/getfollows/:userId", userController.getFollows);

module.exports = router;
