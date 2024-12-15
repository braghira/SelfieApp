const express = require("express");
const { sendNotification, subscribe, unsubscribe } = require("../controllers/pushSubController");
const { requireAuth } = require("../middleware/authentication")

const router = express.Router();

// protect these routes with our middleware
router.use(requireAuth);

// subscribe a new device
router.post("/subscribe", subscribe);

// unsubscribe a device
router.post("/unsubscribe", unsubscribe);

// send notification to all of user's devices
router.post("/sendNotification", sendNotification);

module.exports = router;