// const express = require("express");
// const dotenv = require("dotenv");

// const { google } = require('googleapis');
// const bodyParser = require('body-parser');
// const connectDB = require("./config/db");
// const userRoutes = require("./routes/userRoutes");
// const fileRoutes = require('./routes/fileRoutes');
// const stripeRoutes = require("./routes/stripeRoutes");
// const facilityRoutes = require("./routes/facilityRoutes");
// const calendarRoutes = require('./routes/calendarRoutes');
// const { initializeSocket } = require("./config/socket");


// const cors = require("cors");

// dotenv.config();
// connectDB();


// const corsOptions = {
//   origin: [process.env.NEXT_BASE_URL, "https://document-processing-platform-frontend.vercel.app"], // Allow only this origin
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow specific HTTP methods
//   credentials: true,
// };

// const app = express();

// // Use CORS middleware BEFORE defining routes
// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// // Middleware to parse JSON
// app.use(express.json());

// // Set up OAuth2 client
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,     // Replace with your credentials
//   process.env.CLIENT_SECRET, // Replace with your credentials
//   process.env.REDIRECT_URI   // e.g., "http://localhost:3000"
// );
// // Initialize Socket.IO
// const server = initializeSocket(app);

// app.get('/', async (req, res) => {
//   res.json({ message: 'Server is running' });
// });
// app.use("/api/stripe", stripeRoutes);
// app.use("/api/users", userRoutes);
// app.use('/api/files', fileRoutes);
// app.use("/api/facility", facilityRoutes);
// app.use('/api/calendar', calendarRoutes);

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });
// // Error handling middleware (optional for debugging)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Internal server error", error: err.message });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));




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

dotenv.config();
connectDB(); // Database connection


// Notification Schema
const NotificationSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);


const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
  origin: ["http://localhost:3000", process.env.NEXT_BASE_URL], // Allow frontend origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials (cookies, etc.)
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Set up HTTP server
const server = http.createServer(app);

// Set up Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow frontend connection
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for events
  socket.on("sendNotification", (notification) => {
    console.log("Notification received:", notification);
    io.emit("receiveNotification", notification); // Broadcast notification to all clients
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get('/api/notifications', async (req, res) => {
  const notifications = await Notification.find().sort({ timestamp: -1 });
  res.json(notifications);
});

// Endpoint to Create Notification
app.post('/api/notifications', async (req, res) => {
  const { message } = req.body;
  const notification = new Notification({ message });
  await notification.save();

  // Emit to all connected clients
  io.emit('notification', notification);
  res.status(201).json(notification);
});
// Attach the io instance to all requests
app.use((req, res, next) => {
  req.io = io; // Attach the Socket.IO instance to the req object
  next();
});

// Routes
app.use("/api/stripe", stripeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/facility", facilityRoutes);
app.use("/api/calendar", calendarRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Preflight request handling
app.options("*", cors(corsOptions));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Start server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));






