// src/models/Torrent.js
const mongoose = require('mongoose');

const torrentSchema = new mongoose.Schema({
  name: { type: String},
  magnetLink: { type: String, required: true },
});

const Torrent = mongoose.model('Torrent', torrentSchema);

module.exports = Torrent;
