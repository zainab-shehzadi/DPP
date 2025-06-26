const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
  tagId: {
    type: String,
    required: true,
  },
  Tasks: [
    {
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
    },
  ],
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
