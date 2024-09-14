const express = require("express");
const { requireAuth } = require("../middleware/authentication");
const {
    getActivities,
    getActivity,
    createActivity,
    deleteActivity,
    updateActivity,
} = require("../controllers/activityController");

const router = express.Router();
// protect these routes with our middleware
router.use(requireAuth);

// GET all activities
router.get("/", getActivities);

// GET a single activity
router.get("/:id", getActivity);

// POST new activity
router.post("/", createActivity);

// DELETE a activity
router.delete("/:id", deleteActivity);

// PATCH (update) an activity
router.patch("/:id", updateActivity);

module.exports = router;