const express = require('express');
const { google } = require('googleapis');

const router = express.Router();
const Task = require("../models/taskSchema");

const User = require("../models/User");
// OAuth2 Client setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// In-memory storage for simplicity (replace with database for production)
let savedRefreshToken = "";

// Route to generate Google OAuth URL
router.get('/auth-url', (req, res) => {
  console.log('token')
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // Ensures we get a refresh token
    scope: SCOPES,
  });

  res.status(200).json({ authUrl });
});

// router.get("/callback", async (req, res) => {
//   const { code } = req.query;

//   if (!code) {
//     return res.status(400).json({ error: "Authorization code not provided" });
//   }

//   try {
//     // Exchange the authorization code for tokens
//     const { tokens } = await oAuth2Client.getToken(code);

//     // Log the tokens for debugging purposes
//     console.log("Access Token:", tokens.access_token);
//     console.log("Refresh Token:", tokens.refresh_token);

//     // Redirect to the dashboard with the access token as a query parameter
//     const redirectUrl = `${process.env.FRONTEND_URL}/Dashboard?accessToken=${encodeURIComponent(tokens.access_token)}`;
//     res.redirect(redirectUrl);
//   } catch (error) {
//     console.error("Error during token exchange:", error.message);
//     res.status(500).json({ error: "Failed to exchange token", details: error.message });
//   }
// });



// // Route to handle Google OAuth callback
// router.get('/callback', async (req, res) => {
//   const { code } = req.query;
  
//   console.log('call back', code)
  
//   if (!code) {
//     return res.status(400).json({ error: 'Authorization code not provided' });
//   }

//   try {
//     // Exchange the authorization code for tokens
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the refresh token (in memory for this example)
//     if (tokens.refresh_token) {
//       savedRefreshToken = tokens.refresh_token;
//       console.log('Refresh token saved:', savedRefreshToken);
//     }

//     res.status(200).json({ message: 'Authorization successful', tokens });
//   } catch (error) {
//     console.error('Error during token exchange:', error.message);
//     res.status(500).json({ error: 'Failed to exchange token', details: error.message });
//   }
// });


router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code not provided" });
  }

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);

    // Log the tokens for debugging purposes
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);

    // Send tokens in JSON response
    res.status(200).json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token, // Store this securely in the backend
      expiresIn: tokens.expiry_date, // Optional: Token expiration time
    });
  } catch (error) {
    console.error("Error during token exchange:", error.message);
    res.status(500).json({ error: "Failed to exchange token", details: error.message });
  }
});

router.post('/create-event', async (req, res) => {
  console.log('Received request to create event...');

  const { summary, start, end } = req.body; // Extract only required fields
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  // Extract the access token from the Authorization header
  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  try {
    // Set the access token in OAuth2 client
    oAuth2Client.setCredentials({ access_token: accessToken });

    // Google Calendar API instance
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Event details with simplified structure
    const event = {
      summary, // Task title
      start,   // Start time
      end,     // End time
      
    };

    // Insert the event into the primary calendar
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('Event created successfully:', result.data);
    res.status(200).json({
      message: 'Event created successfully!',
      status: 'pending', // Initial status
      event: {
        id: result.data.id,
        summary: result.data.summary,
        start: result.data.start,
        end: result.data.end,
      },
    });
  } catch (error) {
    console.error('Error creating event:', error.message);

    // Handle token-related errors
    if (error.code === 401 || error.message.toLowerCase().includes('invalid')) {
      return res.status(401).json({
        error: 'Invalid or expired access token',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to create event',
      details: error.message,
    });
  }
});

router.post("/save-tasks", async (req, res) => {
  const { tagId, tasks } = req.body;

  // Validate input
  if (!tagId || !Array.isArray(tasks) || tasks.length === 0) {
    console.error("Validation failed. Received tagId:", tagId, "and tasks:", tasks);
    return res.status(400).json({
      success: false,
      error: "Invalid tag ID or tasks data. Ensure 'tagId' is provided and 'tasks' is a non-empty array.",
    });
  }

  try {
    // Process each task
    for (const task of tasks) {
      console.log("Processing task:", task);

      // Check if task.summary exists and contains a hyphen (assuming department is in summary)
      if (task.summary && task.summary.includes('-')) {
         // Extract the part after ':' and before '-'
        const taskPart = task.summary.split(':')[1]?.split('-')[0]?.trim();
        const DepartmentName = task.summary.split('-')[1]?.trim();
        task.TaskPart = taskPart || "No task"; // Store the task portion
        task.DepartmentName = DepartmentName || "No department"; // Add DepartmentName to the task object
        if (DepartmentName) {
          console.log("Extracted department:", DepartmentName);

        // Fetch users from the department
const users = await User.find({ DepartmentName });

console.log("Users found in the department:", users);

// If users found for the department, assign task to them
if (users.length > 0) {
  task.assignedTo = users.map(user => ({
    userId: user._id,        // Store the user's ObjectId
    firstname: user.firstname // Store the user's firstname
  }));
  console.log("Assigned users:", task.assignedTo); 
} else {
  task.assignedTo = null; // No users found, setting assignedTo to null
  console.log("No users found in the department. Setting assignedTo to null.");
}

        } else {
          console.log("No department extracted from task.summary.");
          task.assignedTo = null;  // No valid department extracted, assigning null
        }
      } else {
        console.log("No valid department found in task.summary.");
        task.assignedTo = null;  // No department or format issue, assigning null
      }
    }

    // Format tasks before saving
    const formattedTasks = tasks.map((task) => ({
      taskSummary: task.TaskPart || "No summary provided",
      DepartmentName: task.DepartmentName,
      startDate: task.start?.dateTime ? new Date(task.start.dateTime) : new Date(),
      endDate: task.end?.dateTime ? new Date(task.end.dateTime) : new Date(),
      assignedTo: task.assignedTo || null, // Use the updated assignedTo field with both userId and firstname
      status: task.status || "pending", // Default to pending if no status
    }));

    // Check if a task document exists for the given tagId
    let existingTaskDoc = await Task.findOne({ tagId });

    if (existingTaskDoc) {
      // Append tasks to the existing document
      existingTaskDoc.Tasks.push(...formattedTasks);
      await existingTaskDoc.save();
      console.log("Tasks appended to the existing document:", existingTaskDoc);
      res.status(200).json({ success: true, data: existingTaskDoc });
    } else {
      // Create a new task document if no existing one is found
      const newTaskDoc = new Task({ tagId, Tasks: formattedTasks });
      const savedTaskDoc = await newTaskDoc.save();
      console.log("New task document created and saved:", savedTaskDoc);
      res.status(200).json({ success: true, data: savedTaskDoc });
    }
  } catch (error) {
    console.error("Error saving tasks to the database:", error);

    res.status(500).json({
      success: false,
      error: "Failed to save tasks to the database. Please try again later.",
    });
  }
});

// router.post("/taskdetail", async (req, res) => {

//   const { department } = req.body;
//   console.log("Request body received:", req.body); // Log the entire request body

//   // Validate request
//   if (!department) {
//     console.warn("Department is missing in the request body."); // Log a warning for missing department
//     return res.status(400).json({
//       success: false,
//       message: "Department is required to fetch tasks.",
//     });
//   }

//   try {
//     console.log(`Fetching tasks for department: ${department}`); // Log the department being queried

//     // Find tasks where the department matches
//     const taskDocuments = await Task.find({
//       "Tasks.DepartmentName": department,
//     });

//     console.log("Query result:", taskDocuments); // Log the query result

//     // Extract and filter tasks for the department
//     const filteredTasks = taskDocuments.flatMap((taskDoc) =>
//       taskDoc.Tasks.filter((task) => task.DepartmentName === department)
//     );

//     console.log("Filtered tasks:", filteredTasks); // Log the filtered tasks

//     // If no tasks found, return an appropriate message
//     if (!filteredTasks || filteredTasks.length === 0) {
//       console.warn(`No tasks found for department: ${department}`); // Log a warning for no results
//       return res.status(404).json({
//         success: false,
//         message: `No tasks found for department: ${department}`,
//       });
//     }

//     // Respond with the filtered tasks
//     return res.status(200).json({
//       success: true,
//       tasks: filteredTasks,
//     });
//   } catch (error) {
//     console.error("Error fetching tasks:", error); // Log the error stack
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching tasks.",
//     });
//   }
// });

router.post("/taskdetail", async (req, res) => {
  const { department } = req.body;
  console.log("Request body received:", req.body); // Log the entire request body

  // Validate request
  if (!department) {
    console.warn("Department is missing in the request body."); // Log a warning for missing department
    return res.status(400).json({
      success: false,
      message: "Department is required to fetch tasks.",
    });
  }

  try {
    console.log(`Fetching tasks for department: ${department}`); // Log the department being queried

    // Find tasks where the department matches
    const taskDocuments = await Task.find({
      "Tasks.DepartmentName": department,
    });

    console.log("Query result:", taskDocuments); // Log the query result

    // Extract and filter tasks for the department
    const filteredTasks = taskDocuments.flatMap((taskDoc) =>
      taskDoc.Tasks.filter((task) => task.DepartmentName === department)
    );

    // Map tasks to include their `_id` field explicitly if needed
    const tasksWithId = filteredTasks.map((task) => ({
      ...task.toObject(), // Convert Mongoose object to plain JavaScript object if needed
      _id: task._id,
    }));

    console.log("Filtered tasks with IDs:", tasksWithId); // Log the filtered tasks with IDs

    // If no tasks found, return an appropriate message
    if (!tasksWithId || tasksWithId.length === 0) {
      console.warn(`No tasks found for department: ${department}`); // Log a warning for no results
      return res.status(404).json({
        success: false,
        message: `No tasks found for department: ${department}`,
      });
    }

    // Respond with the filtered tasks
    return res.status(200).json({
      success: true,
      tasks: tasksWithId,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error); // Log the error stack
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching tasks.",
    });
  }
});

router.put('/updateTask', async (req, res) => {
  const { id, status } = req.body;
  // Validate input
  if (!id || !status) {
    console.warn('Validation failed. Missing id or status:', { id, status }); // Warn if input is invalid
    return res.status(400).json({
      success: false,
      message: 'Task ID and status are required.',
    });
  }

  try {
    // Update the task tatus in the database
    const updatedTask = await Task.findOneAndUpdate(
      { 'Tasks._id': id }, // Match the task by its _id
      { $set: { 'Tasks.$.status': status } }, // Use positional operator to update the status
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      console.warn('Task not found for id:', id); // Warn if the task wasn't found
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

   

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully.',
      updatedTask,
    });
  } catch (error) {
    console.error('Error updating task status:', error); // Log the error stack

    res.status(500).json({
      success: false,
      message: 'Failed to update task status. Please try again later.',
    });
  }
});



// router.post("/save-tasks", async (req, res) => {
//   const { tagId, tasks } = req.body;

//   // console.log("saveTasksWithID called with tagId:", tagId, "and tasks:", tasks);

//   // Validate input
//   if (!tagId || !Array.isArray(tasks) || tasks.length === 0) {
//     console.error("Validation failed. Received tagId:", tagId, "and tasks:", tasks);
//     return res.status(400).json({
//       success: false,
//       error: "Invalid tag ID or tasks data. Ensure 'tagId' is provided and 'tasks' is a non-empty array.",
//     });
//   }

//   try {
//     // Format tasks
//     const formattedTasks = tasks.map((task) => ({
//       taskSummary: task.summary || "No summary provided",
//       startDate: task.start?.dateTime ? new Date(task.start.dateTime) : new Date(),
//       endDate: task.end?.dateTime ? new Date(task.end.dateTime) : new Date(),
//       assignedTo: task.assignedTo || null,
//       status: task.status || "pending",
//     }));

//     // console.log("Formatted tasks ready for insertion:", formattedTasks);

//     // Check if a task document exists for the given tagId
//     let existingTaskDoc = await Task.findOne({ tagId });

//     if (existingTaskDoc) {
//       // Append tasks to the existing document
//       existingTaskDoc.Tasks.push(...formattedTasks);
//       await existingTaskDoc.save();
//       console.log("Tasks appended to the existing document:", existingTaskDoc);
//       res.status(200).json({ success: true, data: existingTaskDoc });
//     } else {
//       // Create a new task document
//       const newTaskDoc = new Task({ tagId, Tasks: formattedTasks });
//       const savedTaskDoc = await newTaskDoc.save();
//       console.log("New task document created and saved:", savedTaskDoc);
//       res.status(200).json({ success: true, data: savedTaskDoc });
//     }
//   } catch (error) {
//     console.error("Error saving tasks to the database:", error);

//     res.status(500).json({
//       success: false,
//       error: "Failed to save tasks to the database. Please try again later.",
//     });
//   }
// });



module.exports = router;