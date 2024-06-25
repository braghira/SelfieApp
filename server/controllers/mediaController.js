const path = require("path");
const Media = require("../models/mediaModel");
const fs = require("fs");

/** @returns the default profile picture id */
async function getDefaultPic() {
  const defaultImagePath = path.resolve(
    __dirname,
    "..",
    "public",
    "default.png"
  );
  const imageData = fs.readFileSync(defaultImagePath);

  const defaultProfilePic = await Media.create({
    name: "default-profile-pic.jpg",
    mimeType: "image/png",
    data: imageData,
  });

  return defaultProfilePic._id;
}

async function addNewMedia(req, res) {
  const { data, mimetype, name } = req.body;

  const media = await Media.create({
    data,
    mimetype,
    name,
  });

  res.set("Content-Type", media.mimeType);
  res.send(media.data);
}

async function deleteMediaById(req, res) {
  await Media.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Media deleted correctly" });
}

async function getMediaById(req, res) {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).send("Media not found");
    }
    res.set("Content-Type", media.contentType);
    res.send(media.data);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = {
  getDefaultPic,
  addNewMedia,
  deleteMediaById,
  getMediaById,
};
