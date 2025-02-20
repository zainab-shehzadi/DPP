const { oauth2Client, calendar } = require('../config/googleConfig');
const Task = require("../models/taskSchema");
// Generate Google OAuth URL
exports.getAuthUrl = (req, res) => {
  try {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.json({ success: true, url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Handle OAuth callback
exports.googleCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.json({ success: true, tokens });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  const event = req.body;
  console.log('Received event:', event);

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    console.log('Event created successfully:', response.data);
    res.status(200).json({ success: true, event: response.data });
  } catch (error) {
    console.error('Error while creating event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveTasksWithID = async (req, res) => {
  const { tagId, tasks } = req.body;

  console.log('saveTasksWithID called with tagId:', tagId, 'and tasks:', tasks);

  if (!tagId || !Array.isArray(tasks) || tasks.length === 0) {
    console.error('Validation failed. Received tagId:', tagId, 'and tasks:', tasks);
    return res.status(400).json({ success: false, error: 'Invalid tag ID or tasks data' });
  }

  try {
    const formattedTasks = tasks.map((task) => ({
      
      taskSummary: task.summary,
      startDate: new Date(task.start.dateTime),
      endDate: new Date(task.end.dateTime),
      assignedTo: task.assignedTo,
      status: task.status || 'pending',
      tagId,
    }));

    const savedTasks = await Task.insertMany(formattedTasks);

    // console.log('Tasks saved to the database successfully:', savedTasks);

    res.status(200).json({ success: true, data: savedTasks });
  } catch (error) {
    console.error('Error saving tasks to the database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
