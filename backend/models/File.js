
const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true, 
  },
  shortDescription: {
    type: String,
    required: true, 
  },
  longDescription: {
    type: String,
    required: true, 
  },
  status: {
    type: String,
    enum: ["not assigned", "assigned"], 
    default: "not assigned", 
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


const FileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, 
  },
  files: [
    {
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
        required: false, 
       
      },
      tags: {
        type: [TagSchema], 
        default: [],
      },
    
      uploadedAt: {
        type: Date,
        default: Date.now, 
      },
    },
  ],
  uploadedAt: {
    type: Date,
    default: Date.now, 
  },
 
});

module.exports = mongoose.model("File", FileSchema);
