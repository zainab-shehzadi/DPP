const { Server } = require("socket.io");
let io;

const initializeSocket = (app) => {
  const server = require("http").createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_BASE_URL, 
      methods: ["GET", "POST"],
    },
  });
 
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("sendNotification", (notification) => {
      io.emit("receiveNotification", notification);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return server; 
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
