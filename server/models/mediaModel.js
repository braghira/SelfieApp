const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  name: String,
  mimeType: String,
  data: Buffer,
});

const Media = mongoose.model("Media", mediaSchema);

module.exports = { Media };
