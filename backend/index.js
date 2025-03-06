

const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const User = require("./models/User");
dotenv.config();
connectDB(); 


const NotificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  notifications: [
    {
      message: String,
      timestamp: { type: Date, default: Date.now },
    }
  ]
});


const Notification = mongoose.model('Notification', NotificationSchema);


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cookieParser()); 

const corsOptions = {
  origin: ["http://localhost:3000", process.env.NEXT_BASE_URL,'*'], 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Set up HTTP server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL, 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("sendNotification", (notification) => {
    console.log("Notification received:", notification);
    io.emit("receiveNotification", notification); 
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get('/api/notifications', async (req, res) => {
  try {
    const { email } = req.query; 

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find notifications for the given email
    const notifications = await Notification.findOne({ email });

    if (!notifications) {
      return res.json({ email, notifications: [] }); 
    }

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required." });
    }

    // Check if a document already exists for the given email
    let notificationDoc = await Notification.findOne({ email });

    if (!notificationDoc) {
      // If no document exists, create a new one
      notificationDoc = new Notification({
        email,
        notifications: [{ message }]
      });
    } else {
      // If a document exists, push the new notification to the array
      notificationDoc.notifications.push({ message });
    }

    await notificationDoc.save();

    io.emit('notification', { email, message });

    res.status(201).json(notificationDoc);
  } catch (error) {
    console.error("Error saving notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Notification ID." });
    }

    // Find a document where the notification exists inside the `notifications` array
    const updatedDoc = await Notification.findOneAndUpdate(
      { "notifications._id": id },
      { $pull: { notifications: { _id: id } } }, // Remove the specific notification
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.status(200).json({ message: "Notification deleted successfully", updatedDoc });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/stripe", stripeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/facility", facilityRoutes);
app.use("/api/calendar", calendarRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.options("*", cors(corsOptions));


cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();
    await User.updateMany(
      { tokenExpiry: { $lte: now } },
      { $set: { accessToken: null, refreshToken: null } } 
    );
    console.log("Expired tokens cleared successfully.");
  } catch (error) {
    console.error("Error clearing expired tokens:", error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));






