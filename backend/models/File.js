// Updated Mongoose Schema
const mongoose = require("mongoose");

const DeficiencySchema = new mongoose.Schema({
  Tag: String,
  Description: String,
  Deficiency: String,
  Solution: {
  type: mongoose.Schema.Types.Mixed, // Accepts any JSON object
  default: {},
},
  status: {
    type: String,
    enum: ["pending", "approved", "assigned"],
    default: "pending",
  },
});

const FileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
  },
  deficiencies: {
    type: [DeficiencySchema],
    default: [],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", FileSchema);
