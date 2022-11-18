const mongoose = require("mongoose");

// Schema
const Schema = mongoose.Schema;

const PreviewSchema = new Schema({
  url: String,
  uid: String,
  directory: String,
  width: Number,
  height: Number,
  creativeId: String,
  previewName: String,
  defaultValues: Object,
  date: {
    type: String,
    default: Date.now(),
  },
});

module.exports = mongoose.model("PreviewModel", PreviewSchema);
