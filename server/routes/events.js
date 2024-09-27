const express = require("express");
const { requireAuth } = require("../middleware/authentication");
const {
  getEvents,
  getEvent,
  createEvent,
  deleteEvent,
  updateEvent,
  updatePomodoro,
} = require("../controllers/eventController");

const router = express.Router();
// protect these routes with our middleware
router.use(requireAuth);

// GET all events
router.get("/", getEvents);

// GET a single event
router.get("/:id", getEvent);

// POST new event
router.post("/", createEvent);

// DELETE a event
router.delete("/:id", deleteEvent);

// UPDATE a event
router.patch("/:id", updateEvent);

// UPDATE a pomodoro event
router.patch("/", updatePomodoro);

module.exports = router;
