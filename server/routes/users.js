const express = require("express");
const { requireAuth } = require("../middleware/authentication");
const { getMatchingUsers, getUser } = require("../controllers/userController");

const router = express.Router();

// Protect routes with authentication middleware
router.use(requireAuth);

// GET all users matching param
router.get("/:string", getMatchingUsers);

// GET single user matching excatly the param
router.get("/single/:string", getUser);

module.exports = router;