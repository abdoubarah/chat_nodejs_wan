const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const port = process.env.PORT || 3000;

const users = [];

// app.get("/", (req, res) => {
//   res.send(`Server is running ${port}`);
// });

// socketio.on("connection", (userSocket) => {
//   console.log("onConnection...");

//   userSocket.on("newChat", (data) => {
//     chatList.push(data);
//     userSocket.emit("chat", chatList);
//     console.log("on message :: ", data);
//   });

//   userSocket.on("typing", (data) => {
//     userSocket.emit("typing", data);
//   });

//   userSocket.on("stop_typing", (data) => {
//     userSocket.emit("stop_typing", data);
//   });
// });

// http.listen(port);

socketio.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register user
  socket.on("registerUser", (userId) => {
    console.log(`User registered: ${userId}`);
    users[userId] = socket.id;
  });

  // Send message
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    console.log(`Message sent from ${senderId} to ${receiverId}: ${message}`);
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("receiveMessage", { senderId, message });
    }
  });

  // Disconnect user
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    // if (userId) {
    //   delete users[userId];
    // }
  });
});

http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
