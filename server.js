const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const port = process.env.PORT || 3000;

const users = [];

app.get("/", (req, res) => {
  res.send(`Server is running ${port}`);
});

socketio.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register user
  socket.on("registerUser", (userId) => {
    console.log(`User registered: ${userId} + socketid : ${socket.id}`);
    users.push({
      userId: userId,
      socketId: socket.id,
    });
  });

  // Send message
  socket.on("sendMessage", ({ sender, receiver, type, msg, sent_time }) => {
    console.log(
      `sendMSG :  ${sender} / ${receiver} / ${type} /  ${msg} /  ${sent_time} `
    );
    const receiverSocketId = users.find(
      (user) => user.userId === receiver
    )?.socketId;
    console.log(`receiverSocketId ${receiverSocketId}`);
    if (receiverSocketId) {
      console.log(`emit receiveMessage ${receiverSocketId}`);
      socket
        .to(receiverSocketId)
        .emit("receiveMessage", { sender, receiver, type, msg, sent_time });
    }
  });

  // Disconnect user
  socket.on("disconnect", (user_id) => {
    // console.log(`User disconnected: ${socket.id}`);
    // const userId = users.find((user) => user.userId === user_id).userId;
    // if (userId) {
    //   delete users[userId];
    // }
  });
});

http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
