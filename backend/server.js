// src/server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8060;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const torrentRoutes = require('./src/routes/torrentRoutes');
app.use('/api/torrents', torrentRoutes);

app.listen(PORT, () => {
    console.log("Server up with port : " + PORT);
  });

//Setting up the database connection
// const URL = process.env.MONGO_URI;

// mongoose.set("strictQuery", true);
// mongoose.connect(URL, { useNewUrlParser: true });

// const connection = mongoose.connection;

// connection.once("open", () => {
//   console.log("MongoDB connection established successfully!");
// });