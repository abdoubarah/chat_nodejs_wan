const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const port = process.env.PORT || 3000;

var connectedUsers = [];

app.get("/", (req, res) => {
  res.send(`Server is running ${port}`);
});

socketio.on("connection", (socket) => {
  socket.on("userConnected", (userData) => {
    console.log(`userConnected id : ${userData} + socketid : ${socket.id}`);
    if (connectedUsers.length > 0) {
      var usr = connectedUsers.find((user) => user.idUser === userData.idUser);
      if (usr == undefined) {
        userData.socketId = socket.id;
        connectedUsers.push(userData);
        console.log(`emit user 1 ${JSON.stringify(connectedUsers)}`);
        socket.broadcast.emit("onlineUsers", connectedUsers);
      } else {
        connectedUsers = connectedUsers.filter(
          (obj) => obj.idUser !== userData.idUser
        );
        userData.socketId = socket.id;
        connectedUsers.push(userData);
        console.log(`emit user 2 ${JSON.stringify(connectedUsers)}`);
        socket.broadcast.emit("onlineUsers", connectedUsers);
      }
    } else {
      userData.socketId = socket.id;
      connectedUsers.push(userData);
      console.log(`emit user 3 ${JSON.stringify(connectedUsers)}`);
      socket.broadcast.emit("onlineUsers", connectedUsers);
    }
  });

  // Send message
  socket.on(
    "sendMessage",
    ({ sender, receiver, type, msg, media_url, sent_time, gift }) => {
      console.log(
        `sendMSG :  ${sender} / ${receiver} / ${type} /  ${msg} /  ${media_url} /  ${sent_time}  / ${JSON.stringify(
          gift
        )}`
      );
      var receiverSocketId = users.find(
        (user) => user.idUser === receiver
      )?.socketId;
      console.log(`receiverSocketId ${receiverSocketId}`);
      if (receiverSocketId) {
        console.log(`emit receiveMessage ${receiverSocketId}`);
        socket.to(receiverSocketId).emit("receiveMessage", {
          sender,
          receiver,
          type,
          msg,
          media_url,
          sent_time,
          gift,
        });
      }
    }
  );

  // Disconnect user
  socket.on("disconnect", (userData) => {
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
