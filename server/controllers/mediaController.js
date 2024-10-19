const path = require("path");
const Media = require("../models/mediaModel");
const fs = require("fs");
const validator = require("validator");

/** 
 * @returns the default profile picture id 
 */
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

const addNewMedia = async (req, res) => {
  const file = req.file; // Il file caricato sarà disponibile qui

  console.log("File received: ", file);

  try {
    if (!file || !file.originalname || !validator.isMimeType(file.mimetype)) {
      throw Error("File is not valid");
    }

    // Crea il media salvando il buffer nel database
    const media = await Media.create({
      data: file.buffer, // Il file caricato è in formato buffer
      mimetype: file.mimetype,
      name: file.originalname,
    });

    console.log("Media ID: ", media._id);

    // Restituisci l'ID del media salvato
    res.status(200).json(media._id);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

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
