const express = require('express');
const { google } = require('googleapis');

const router = express.Router();
const Task = require("../models/taskSchema");

const User = require("../models/User");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get('/auth-url', (req, res) => {

  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', 
    prompt: "consent",
    scope: SCOPES,
  });

  res.status(200).json({ authUrl });
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code not provided" });
  }

  try {

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
 
    const email = req.cookies.email;

    if (!email) {
      return res.status(400).json({ error: "Email not found in cookies" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { 
        accessToken: tokens.access_token, 
        refreshToken: tokens.refresh_token 
      },
      { new: true, upsert: true } 
    );
    
    if (user) {
      console.log("Tokens updated successfully for:", email);
    } else {
      console.log("User not found, unable to update tokens:", email);
    }
    
    const redirectUrl = `${process.env.FRONTEND_URL}/UploadDoc`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error during token exchange:", error.message);
    res.status(500).json({ error: "Failed to exchange token", details: error.message });
  }
});

router.post('/create-event', async (req, res) => {


  const { summary, start, end } = req.body; 
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }


  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  try {
    
    oAuth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const event = {
      summary, 
      start,   
      end,    
    };

  
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

  
    res.status(200).json({
      message: 'Event created successfully!',
      status: 'pending',
      event: {
        id: result.data.id,
        summary: result.data.summary,
        start: result.data.start,
        end: result.data.end,
      },
    });
  } catch (error) {
    console.error('Error creating event:', error.message);


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


  if (!tagId || !Array.isArray(tasks) || tasks.length === 0) {
    console.error("Validation failed. Received tagId:", tagId, "and tasks:", tasks);
    return res.status(400).json({
      success: false,
      error: "Invalid tag ID or tasks data. Ensure 'tagId' is provided and 'tasks' is a non-empty array.",
    });
  }

  try {
   
    for (const task of tasks) {
      console.log("Processing task:", task);

   
      if (task.summary && task.summary.includes('-')) {

        const taskPart = task.summary.split(':')[1]?.split('-')[0]?.trim();
        const DepartmentName = task.summary.split('-')[1]?.trim();
        task.TaskPart = taskPart || "No task";
        task.DepartmentName = DepartmentName || "No department"; 
        if (DepartmentName) {
       

const users = await User.find({ DepartmentName });

if (users.length > 0) {
  task.assignedTo = users.map(user => ({
    userId: user._id,       
    firstname: user.firstname 
  }));
  console.log("Assigned users:", task.assignedTo); 
} else {
  task.assignedTo = null; 
  console.log("No users found in the department. Setting assignedTo to null.");
}

        } else {
          console.log("No department extracted from task.summary.");
          task.assignedTo = null;  
        }
      } else {
        console.log("No valid department found in task.summary.");
        task.assignedTo = null;  
      }
    }


    const formattedTasks = tasks.map((task) => ({
      taskSummary: task.TaskPart || "No summary provided",
      DepartmentName: task.DepartmentName,
      startDate: task.start?.dateTime ? new Date(task.start.dateTime) : new Date(),
      endDate: task.end?.dateTime ? new Date(task.end.dateTime) : new Date(),
      assignedTo: task.assignedTo || null, 
      status: task.status || "pending", 
    }));

  
    let existingTaskDoc = await Task.findOne({ tagId });

    if (existingTaskDoc) {
    
      existingTaskDoc.Tasks.push(...formattedTasks);
      await existingTaskDoc.save();
      console.log("Tasks appended to the existing document:", existingTaskDoc);
      res.status(200).json({ success: true, data: existingTaskDoc });
    } else {
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


router.post("/taskdetail", async (req, res) => {
  const { department } = req.body;

  if (!department) {
    console.warn("Department is missing in the request body."); 
    return res.status(400).json({
      success: false,
      message: "Department is required to fetch tasks.",
    });
  }

  try {
    console.log(`Fetching tasks for department: ${department}`); 

    const taskDocuments = await Task.find({
      "Tasks.DepartmentName": department,
    });

    console.log("Query result:", taskDocuments);
    const filteredTasks = taskDocuments.flatMap((taskDoc) =>
      taskDoc.Tasks.filter((task) => task.DepartmentName === department)
    );

   
    const tasksWithId = filteredTasks.map((task) => ({
      ...task.toObject(), 
      _id: task._id,
    }));

    console.log("Filtered tasks with IDs:", tasksWithId);

 
    if (!tasksWithId || tasksWithId.length === 0) {
      console.warn(`No tasks found for department: ${department}`);
      return res.status(404).json({
        success: false,
        message: `No tasks found for department: ${department}`,
      });
    }


    return res.status(200).json({
      success: true,
      tasks: tasksWithId,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error); 
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching tasks.",
    });
  }
});

router.put('/updateTask', async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) {
    console.warn('Validation failed. Missing id or status:', { id, status });
    return res.status(400).json({
      success: false,
      message: 'Task ID and status are required.',
    });
  }

  try {
 
    const updatedTask = await Task.findOneAndUpdate(
      { 'Tasks._id': id }, 
      { $set: { 'Tasks.$.status': status } },
      { new: true } 
    );

    if (!updatedTask) {
      console.warn('Task not found for id:', id);
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
    console.error('Error updating task status:', error); 
    res.status(500).json({
      success: false,
      message: 'Failed to update task status. Please try again later.',
    });
  }
});



module.exports = router;