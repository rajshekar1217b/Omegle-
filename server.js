const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for testing
        methods: ["GET", "POST"]
    }
});

let waitingUsers = [];

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("findPartner", () => {
        if (waitingUsers.length > 0) {
            const partnerSocket = waitingUsers.pop();
            socket.partnerId = partnerSocket.id;
            partnerSocket.partnerId = socket.id;

            socket.emit("partnerFound", { partnerId: partnerSocket.id });
            partnerSocket.emit("partnerFound", { partnerId: socket.id });
        } else {
            waitingUsers.push(socket);
            socket.emit("waiting");
        }
    });

    socket.on("signal", (data) => {
        const partnerId = socket.partnerId;
        if (partnerId) {
            io.to(partnerId).emit("signal", {
                from: socket.id,
                signal: data.signal
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        waitingUsers = waitingUsers.filter((s) => s.id !== socket.id);

        if (socket.partnerId) {
            io.to(socket.partnerId).emit("partnerDisconnected");
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 3000");
});
