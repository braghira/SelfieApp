const express = require("express");
const multer = require("multer");
const {
  getMediaById,
  deleteMediaById,
  addNewMedia,
} = require("../controllers/mediaController");

// Multer setup to save file into RAM
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// GET single media by id
router.get("/:id", getMediaById);

// POST single media
router.post("/", upload.single("data"), addNewMedia);

// DELETE single media by id
router.delete("/:id", deleteMediaById);

module.exports = router;
