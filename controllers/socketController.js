const socketIo = require("socket.io");

const initialSocket = (server) => {
  const io = socketIo(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });

    socket.on("message", (message) => {
      console.log("Message recieved", message);

      io.emit("message", message);
    });
  });
};

module.exports = initialSocket;
