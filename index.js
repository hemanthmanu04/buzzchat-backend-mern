import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messagesRoutes.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
dotenv.config();
const app = express();
app.use(express.json());

// Configure CORS
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

const port = process.env.PORT || 5005; // Provide a default port if not specified in .env

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", (request, response) => {
  return response.status(234).send("Welcome to Buzzchat2");
});

const server = app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });
});
