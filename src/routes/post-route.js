const express = require("express");
const router = express.Router();

const postController = require("../controllers/post-controller");
const authenticate = require("../middlewares/authenticate");

router.post("/createpost", authenticate, postController.createPost);
router.get("/getposts", authenticate, postController.getPost);
router.get("/getpostbyid/:postId", postController.getPostById);
router.get("/getpostbyuserid/:userId", postController.getPostByUserId);

module.exports = router;
