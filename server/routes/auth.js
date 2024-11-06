const express = require("express");
const router = express.Router();
const {
  loginUser,
  signupUser,
  refreshToken,
  logoutUser,
} = require("../controllers/authController");
const { loginLimiter } = require("../middleware/authentication");

// login user
router.post("/login", loginLimiter, loginUser); // add a layer of security with rate limiter middleware

// register user
router.post("/signup", signupUser);

// refresh token
router.get("/refresh", refreshToken);

// logout user
router.post("/logout", logoutUser);

module.exports = router;
