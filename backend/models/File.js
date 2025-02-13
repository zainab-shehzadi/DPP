
const mongoose = require("mongoose");

// Subschema for tags with descriptions and a response field
const TagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true, // Tag name
  },
  shortDescription: {
    type: String,
    required: true, // Short description for the tag
  },
  longDescription: {
    type: String,
    required: true, // Detailed context for the tag
  },
  response: {
    heading_sections: {
      type: Array,
      required: false,
    },
    solution: {
      type: [String],  // Change this to an array of strings
      required: false,
    },
    supporting_references: {
      type: Array,
      required: false,
    },
    Department: {
      type: Array,
      required: false,
    },
    policies: {
      type: Array,
      required: false,
    },
    task: {
      type: Array,
      required: false,
    },

  },
});

// Main file schema
const FileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // Corresponding email passed from the dashboard
  },
  files: [
    {
      originalName: {
        type: String,
        required: true, // Original name of the uploaded file
      },
      fileUrl: {
        type: String,
        required: true, // URL where the file is stored (e.g., S3)
       
      },
      filePath: {
        type: String,
        required: false, // ✅ Changed to optional since S3 uploads may not have a local path
       
      },
      tags: {
        type: [TagSchema], // Array of tags with descriptions and a response field
        default: [],
      },
      uploadedAt: {
        type: Date,
        default: Date.now, // Timestamp of file upload
      },
    },
  ],
});

// Export the model
module.exports = mongoose.model("File", FileSchema);
