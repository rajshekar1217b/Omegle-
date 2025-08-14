const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("ChatConnect signaling server running");
});

// Store connected users
let users = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  users.push(socket.id);

  // Send the total online count
  io.emit("onlineUsers", users.length);

  // Relay signaling messages
  socket.on("offer", (data) => {
    socket.to(data.target).emit("offer", {
      sdp: data.sdp,
      caller: socket.id
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.target).emit("answer", {
      sdp: data.sdp
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.target).emit("ice-candidate", {
      candidate: data.candidate
    });
  });

  // Random partner request
  socket.on("findPartner", () => {
    const availableUsers = users.filter(id => id !== socket.id);
    if (availableUsers.length > 0) {
      const partner = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      socket.emit("partnerFound", partner);
      socket.to(partner).emit("partnerFound", socket.id);
    } else {
      socket.emit("noPartner");
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    users = users.filter(id => id !== socket.id);
    io.emit("onlineUsers", users.length);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
