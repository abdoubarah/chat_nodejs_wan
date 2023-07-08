const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
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
    this.socketId = socketId;
  }
}

app.get("/", (req, res) => {
  res.send(`Server is running ${port}`);
});

io.on("connection", (socket) => {
  console.log(`A user connected. ${JSON.stringify(socket.id)}`);

  // Show connetced users
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

    const objectExists = connectedUsers.some(
      (obj) => obj.idUser === user.idUser
    );
    if (!objectExists) {
      connectedUsers.push(user);
    }
    console.log(`onlineUsers  ${JSON.stringify(connectedUsers.length)}`);
    io.emit("onlineUsers", connectedUsers);
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
      var receiverSocketId = connectedUsers.find(
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

  // Stories refresh
  socket.on("onAddStory", (story) => {
    console.log(`onEmitStory  ${JSON.stringify(story)}`);
    io.emit("onEmitStory", story);
  });

  // Disconnect user
  socket.on("userDisconnected", (idUser) => {
    console.log(`Disconnected: ${idUser}`);
    const index = connectedUsers.findIndex((obj) => obj.idUser == idUser);
    if (index > -1) {
      connectedUsers.splice(index, 1);
      console.log(`Object removed successfully. ${idUser}`);
    } else {
      console.log("Object not found or array is empty.");
    }
    io.emit("onlineUsers", connectedUsers);
  });
});

//videoCall
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var men = [];
var women = [];

app.get("/m", (req, res) => {
  res.send(JSON.stringify(men));
});

app.get("/f", (req, res) => {
  res.send(JSON.stringify(women));
});

app.get("/a", (req, res) => {
  res.send(JSON.stringify(men.concat(women)));
});

app.post("/addm", (req, res) => {
  let data = req.body;
  men.push(data["id"]);
  res.sendStatus(200);
});

app.post("/addw", (req, res) => {
  let data = req.body;
  women.push(data["id"]);
  res.sendStatus(200);
});

app.post("/join", (req, res) => {
  let data = req.body;
  if (men.includes(data["id"])) {
    const index = men.indexOf(data["id"]);
    men.splice(index, 1);
  } else {
    if (women.includes(data["id"])) {
      const index = women.indexOf(data["id"]);
      women.splice(index, 1);
    }
  }
  res.sendStatus(200);
});

http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
