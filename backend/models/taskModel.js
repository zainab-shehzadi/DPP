// const mongoose = require("mongoose");

// const TaskSchema = new mongoose.Schema({
//   task: String,
//   department: String,
//   role: String,
//   assignedTo: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   ],
//   status: {
//     type: String,
//     enum: ["pending", "in-progress", "completed"],
//     default: "pending",
//   },
//   startDate: {
//     type: Date,
//     default: Date.now,
//   },
//   endDate: {
//     type: Date,
//     default: Date.now,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const TaskGroupSchema = new mongoose.Schema({
//   solutionText: {
//     type: String,
//     required: true,
//   },
//   documentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Document",
//     default: null,
//   },
//   documentName: {
//     type: String,
//     default: null,
//   },
//   tasks: [TaskSchema],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("TaskGroup", TaskGroupSchema);

const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  headline: {
    type: String,
    
  },
  description: {
    type: String,
   
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "custom"],
    default: "daily",
  },

customSchedule: {
  type: String,
  default: "",
},

  task: String,
  department: {
    type: String,
  },
  role: String,
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskGroupSchema = new mongoose.Schema({
  solutionText: {
    type: String,
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    default: null,
  },
  documentName: {
    type: String,
    default: null,
  },
  tasks: [TaskSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TaskGroup", TaskGroupSchema);
