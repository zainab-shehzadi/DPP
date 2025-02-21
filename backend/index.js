

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

dotenv.config();
connectDB(); 


// Notification Schema
const NotificationSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cookieParser()); 

const corsOptions = {
  origin: ["http://localhost:3000", process.env.NEXT_BASE_URL], 
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
    origin: "http://localhost:3000", // Allow frontend connection
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
  const notifications = await Notification.find().sort({ timestamp: -1 });
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  const { message } = req.body;
  const notification = new Notification({ message });
  await notification.save();

  // Emit to all connected clients
  io.emit('notification', notification);
  res.status(201).json(notification);
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));






