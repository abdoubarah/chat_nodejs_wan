const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`Server is running ${port}`);
});

socketio.on("connection", (userSocket) => {
  console.log("onConnection...");
  userSocket.on("message", (data) => {
    userSocket.emit("message", data);
  });

  userSocket.on("typing", (data) => {
    userSocket.emit("typing", data);
  });

  userSocket.on("stop_typing", (data) => {
    userSocket.emit("stop_typing", data);
  });
});

http.listen(port);
