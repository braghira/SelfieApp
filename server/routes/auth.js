const express = require("express");
const router = express.Router();
const {
  loginUser,
  signupUser,
  refreshToken,
  logoutUser,
  subscribe,
  unsubscribe,
  sendNotification
} = require("../controllers/authController");
const { loginLimiter } = require("../middleware/authentication");


// login route
router.post("/login", loginLimiter, loginUser); // add a layer of security with rate limiter middleware

// register route
router.post("/signup", signupUser);

// refresh token route
router.get("/refresh", refreshToken);

// logout route
router.post("/logout", logoutUser);

// subscribe a new device
router.post("/subscribe", subscribe);

// unsubscribe a device
router.post("/unsubscribe", unsubscribe);

// send notification to all of user's devices
router.post("/sendNotification", sendNotification);

module.exports = router;
