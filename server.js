const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const port = process.env.PORT || 3000;

var connectedUsers = [];

class UserModel {
  constructor(
    name,
    idUser,
    coins,
    profileImg,
    onlineStatus,
    userType,
    gender,
    countryName,
    countryFlag,
    socketId
  ) {
    this.name = name;
    this.idUser = idUser;
    this.coins = coins;
    this.profileImg = profileImg;
    this.onlineStatus = onlineStatus;
    this.userType = userType;
    this.gender = gender;
    this.countryName = countryName;
    this.countryFlag = countryFlag;
    this.socketId = socketId; // Initialize socketId as null
  }
}

app.get("/", (req, res) => {
  res.send(`Server is running ${port}`);
});

socketio.on("connection", (socket) => {
  console.log(`A user connected. ${JSON.stringify(socket.id)}`);

  socket.on("userConnected", (userData) => {
    console.log(socket.id);
    const user = new UserModel(
      userData.name,
      userData.idUser,
      userData.coins,
      userData.profile_img,
      userData.online_status,
      userData.user_type,
      userData.gender,
      userData.country_name,
      userData.country_flag,
      socket.id
    );

    if (connectedUsers.length > 0) {
      var usr = connectedUsers.find((user) => user.idUser === user.idUser);
      if (usr == undefined) {
        connectedUsers.push(user);
        console.log(`emit user 1 ${JSON.stringify(connectedUsers)}`);
        socket.emit("onlineUsers", connectedUsers);
      } else {
        connectedUsers = connectedUsers.filter(
          (obj) => obj.idUser !== user.idUser
        );
        connectedUsers.push(user);
        console.log(`emit user 2 ${JSON.stringify(connectedUsers)}`);
        socket.emit("onlineUsers", connectedUsers);
      }
    } else {
      connectedUsers.push(user);
      console.log(`emit user 3 ${JSON.stringify(connectedUsers)}`);
      socket.emit("onlineUsers", connectedUsers);
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
    console.log(`User disconnected: ${socket.id}`);
    removeUserById(userData.idUser);
  });
});

function removeUserById(idUser) {
  // Create a new array excluding the user with the matching id
  connectedUsers = connectedUsers.filter((user) => user.idUser !== idUser);
  if (connectedUsers.length === 0) {
    console.log(`User with id ${user.idUser} not found.`);
  } else {
    console.log(`User with id ${user.idUser} removed successfully.`);
  }
}

http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
