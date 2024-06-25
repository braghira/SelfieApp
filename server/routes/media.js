const express = require("express");
const {
  getMediaById,
  deleteMediaById,
  addNewMedia,
} = require("../controllers/mediaController");

const router = express.Router();

// GET single media by id
router.get("/:id", getMediaById);

// POST single media
router.post("/", addNewMedia);

// DELETE single media by id
router.delete("/:id", deleteMediaById);

module.exports = router;
