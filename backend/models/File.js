
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
      type: [String],  
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

const TaskSchema = new mongoose.Schema({
      taskSummary: {
         type: String,
         required: true,
       },
       DepartmentName: {
         type: String,
         required: false,
       },
       startDate: {
         type: Date,
         required: true,
       },
       endDate: {
         type: Date,
         required: true,
       },
     
       assignedTo: [
         {
           userId: {
             type: mongoose.Schema.Types.ObjectId,
             ref: "User",
             required: false,  
           },
           firstname: {
             type: String,
             required: false,  
           },
         },
       ],
     
       status: {
         type: String,
         default: "pending",
         enum: ["pending", "completed", "in-progress"],
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
      tasks: {
        type: [TaskSchema], 
        default: [],
      },
      uploadedAt: {
        type: Date,
        default: Date.now, // Timestamp of file upload
      },
    },
  ],
  uploadedAt: {
    type: Date,
    default: Date.now, 
  },
 
});

module.exports = mongoose.model("File", FileSchema);
