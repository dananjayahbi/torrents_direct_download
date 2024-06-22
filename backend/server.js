// src/server.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
let PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Attach io to app
app.set("io", io);

// Routes
const torrentRoutes = require("./src/routes/torrentRoutes");
app.use("/api/torrents", torrentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//Setting up the database connection
// const URL = process.env.MONGO_URI;

// mongoose.set("strictQuery", true);
// mongoose.connect(URL, { useNewUrlParser: true });

// const connection = mongoose.connection;

// connection.once("open", () => {
//   console.log("MongoDB connection established successfully!");
// });
