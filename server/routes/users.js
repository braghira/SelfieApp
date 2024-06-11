const express = require("express");
const router = express.Router();
const {
  loginUser,
  signupUser,
  refreshToken,
  logoutUser,
} = require("../controllers/userController");
const { loginLimiter } = require("../middleware/requireAuth");

// add a layer of security with rate limiter middleware
// login route
router.post("/login", loginLimiter, loginUser);

// register route
router.post("/signup", signupUser);

// refresh token route
router.get("/refresh", refreshToken);

// logout route
router.post("/logout", logoutUser);

module.exports = router;
