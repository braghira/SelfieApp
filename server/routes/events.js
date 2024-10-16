const express = require("express");
const { requireAuth } = require("../middleware/authentication");
const {
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent,
} = require("../controllers/eventController");

const router = express.Router();
// protect these routes with our middleware
router.use(requireAuth);

// GET all events
router.get("/", getEvents);

// POST new event
router.post("/", createEvent);

// DELETE an event
router.delete("/:id", deleteEvent);

// UPDATE an event
router.patch("/:id", updateEvent);

module.exports = router;
