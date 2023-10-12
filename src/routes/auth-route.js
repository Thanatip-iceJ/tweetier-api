const express = require("express");

const authController = require("../controllers/auth-controller");
const authenticateMw = require("../middlewares/authenticate");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/getauthuser", authenticateMw, authController.getAuth);

module.exports = router;
