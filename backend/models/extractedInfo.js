// models/ExtractedInfo.js
const mongoose = require("mongoose");

const extractedInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true }, 
  tags: [String],
  policies: [String],
  deficiencies: [String],
  updatedPolicy: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ExtractedInfo", extractedInfoSchema);
