const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const port = process.env.PORT || 3000;

var users = [];

app.get("/", (req, res) => {
  res.send(`Server is running ${port}`);
});

socketio.on("connection", (socket) => {
  socket.on("userConnected", (userData) => {
    console.log(`userConnected id : ${userData} + socketid : ${socket.id}`);
    if (users.length > 0) {
      var usr = users.find((user) => user.userData.idUser === userData.idUser);
      console.log(`usr : ${usr}`);
      if (usr == undefined) {
        users.push({
          userData: userData,
          socketId: socket.id,
        });
        socket.broadcast.emit("onlineUsers", users);
      } else {
        users = users.filter((obj) => obj.userData.idUser !== userData.idUser);
        users.push({
          userData: userData,
          socketId: socket.id,
        });
        socket.broadcast.emit("onlineUsers", users);
      }
    } else {
      users.push({
        userData: userData,
        socketId: socket.id,
      });
      socket.broadcast.emit("onlineUsers", users);
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
        (user) => user.userData.idUser === receiver
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
