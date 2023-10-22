const express = require("express");
const router = express.Router();

const postController = require("../controllers/post-controller");
const authenticate = require("../middlewares/authenticate");
const uploadMw = require("../middlewares/upload");

router.post(
  "/createpost",
  authenticate,
  uploadMw.single("img"),
  postController.createPost
);
router.get("/getposts", authenticate, postController.getPost);
router.get("/getpostbyid/:postId", postController.getPostById);
router.get("/getpostbyuserid/:userId", postController.getPostByUserId);
router.post("/like/:postId", authenticate, postController.createLike);
router.delete("/delete/:postId", postController.deletePost);
router.post(
  "/comment/:postId",
  authenticate,
  uploadMw.single("contentImg"),
  postController.createComment
);
router.get("/getcomments/:postId", postController.getComments);
router.delete("/deletecomment/:commentId", postController.deleteComment);
router.get("/getlikes/:postId", postController.getLikes);

module.exports = router;
