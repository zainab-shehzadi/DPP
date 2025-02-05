const { Server } = require("socket.io");
let io;

// Initialize Socket.IO with Express app
const initializeSocket = (app) => {
  // Create an HTTP server using the Express app
  const server = require("http").createServer(app);

  // Attach Socket.IO to the HTTP server
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Frontend URL
      methods: ["GET", "POST"],
    },
  });
 
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for notifications
    socket.on("sendNotification", (notification) => {
      io.emit("receiveNotification", notification); // Broadcast to all connected clients
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return server; // Return the server instance for starting it later
};

// Get the Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
