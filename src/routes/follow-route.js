const express = require("express");
const followController = require("../controllers/follow-controller");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

router.post("/:targetId", authenticate, followController.createFollow);
router.delete("/delete/:targetId", authenticate, followController.unfollow);

module.exports = router;
