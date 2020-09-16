const io = require("socket.io")(4000);
const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "w" });
const log_stdout = process.stdout;

const users = {};

io.on("connection", (socket) => {
  socket.on("new-user", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", name);
  });
  socket.on("send-chat-message", (message) => {
    const date = new Date();
    const text = `${date} - ${users[socket.id]} : ${message}`;
    console.log(text);
    log_file.write(util.format(text) + "\n");
    log_stdout.write(util.format(text) + "\n");
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
    });
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});
