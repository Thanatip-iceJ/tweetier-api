const express = require("express");
const router = express.Router();

const userController = require("../controllers/user-controller");
const authenticate = require("../middlewares/authenticate");

router.get("/getusers", authenticate, userController.getUsers);

module.exports = router;
