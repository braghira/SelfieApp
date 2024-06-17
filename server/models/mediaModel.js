const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  data: String,
  mimetype: String,
  name: String,
});

const Media = mongoose.model("Media", mediaSchema);

/** @returns the default profile picture id */
exports.getDefaultPic = async function () {
  const picture = await Media.findOne({ name: "default_pic" });

  return picture._id;
};

exports.addNewMedia = async function (data, mimetype, name) {
  const media = await Media.create({
    data,
    mimetype,
    name,
  });

  return media._id;
};

exports.deleteMediaById = async function (id) {
  return await Media.findByIdAndDelete(id);
};

exports.getMediaById = async function (id) {
  return await Media.findById(id);
};
