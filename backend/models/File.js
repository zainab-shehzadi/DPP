// // Updated Mongoose Schema
// const mongoose = require("mongoose");

// const DeficiencySchema = new mongoose.Schema({
//   Tag: String,
//   Description: String,
//   Deficiency: String,
//   Solution: {
//   type: mongoose.Schema.Types.Mixed,
//   default: {},
// },
//   status: {
//     type: String,
//     enum: ["pending", "approved", "assigned", "unapproved"],
//     default: "pending",
//   },
// });

// const FileSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   originalName: {
//     type: String,
//     required: true,
//   },
//   fileUrl: {
//     type: String,
//     required: true,
//   },
//   filePath: {
//     type: String,
//   },
//   deficiencies: {
//     type: [DeficiencySchema],
//     default: [],
//   },
//   uploadedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("File", FileSchema);

const mongoose = require("mongoose");

const DeficiencySchema = new mongoose.Schema({
  Tag: String,
  Description: String,
  Deficiency: String,
  QualityOfCareIndicator: {
    type: Boolean,
    default: false,
  },
  Solution: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ["pending", "approved", "assigned", "unapproved"],
    default: "pending",
  },
});

const DeficiencyResponseSchema = new mongoose.Schema({
  success: {
    type: Boolean,
    default: false,
  },
  total_tags: {
    type: Number,
    default: 0,
  },
  quality_of_care_indicators: {
    type: Number,
    default: 0,
  },
  metadata_enhanced: {
    type: Number,
    default: 0,
  },
  filename: String,
  data: {
    type: [DeficiencySchema],
    default: [],
  },
});

const FileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FacilitySignup",
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
  extractedAddress: {
    type: String,
  },
  deficiencies: {
    type: DeficiencyResponseSchema,
    default: () => ({
      success: false,
      total_tags: 0,
      quality_of_care_indicators: 0,
      metadata_enhanced: 0,
      filename: "",
      data: [],
    }),
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", FileSchema);
