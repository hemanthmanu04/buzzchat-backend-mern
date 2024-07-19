import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messagesRoutes.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
dotenv.config();

const app = express();

const corsOptions = {
  origin: "https://buzzchat-frontend-mern.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

// CORS configuration for Express
app.use(cors(corsOptions));

// Ensure preflight requests are handled
app.options("*", cors(corsOptions));

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

const port = process.env.PORT || 5000; // Provide a default port if not specified in .env

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", (request, response) => {
  return response.status(200).send("Welcome to Buzzchat");
});

const server = app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});

// CORS configuration for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://buzzchat-frontend-mern.vercel.app",
    methods: ["GET", "POST"],
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
