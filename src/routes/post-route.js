const express = require("express");
const router = express.Router();

const postController = require("../controllers/post-controller");
const authenticate = require("../middlewares/authenticate");

router.post("/createpost", authenticate, postController.createPost);

module.exports = router;
