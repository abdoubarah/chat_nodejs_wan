const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const port = process.env.PORT || 3000;

var users = [];

app.get("/", (req, res) => {
  res.send(`Server is running ${port}`);
});

socketio.on("connection", (socket) => {
  // Register user
  socket.on("userConnected", (userId) => {
    console.log(`userConnected id : ${userId} + socketid : ${socket.id}`);
    if (users.length > 0) {
      var usr = users.find((user) => user.userId === userId);
      console.log(`usr : ${usr}`);
      if (usr == undefined) {
        users.push({
          userId: userId,
          socketId: socket.id,
        });
      } else {
        users = users.filter((obj) => obj.userId !== usr.userId);
        users.push({
          userId: userId,
          socketId: socket.id,
        });
      }
    } else {
      users.push({
        userId: userId,
        socketId: socket.id,
      });
    }
  });

  // Send message
  socket.on(
    "sendMessage",
    ({ sender, receiver, type, msg, sent_time, gift }) => {
      console.log(
        `sendMSG :  ${sender} / ${receiver} / ${type} /  ${msg} /  ${sent_time}  / ${JSON.stringify(
          gift
        )}`
      );
      var receiverSocketId = users.find(
        (user) => user.userId === receiver
      )?.socketId;
      console.log(`receiverSocketId ${receiverSocketId}`);
      if (receiverSocketId) {
        console.log(`emit receiveMessage ${receiverSocketId}`);
        socket.to(receiverSocketId).emit("receiveMessage", {
          sender,
          receiver,
          type,
          msg,
          sent_time,
          gift,
        });
      }
    }
  );

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
