// src/routes/torrentRoutes.js
const router = require('express').Router();

const {
    downloadTorrent
} = require('../controllers/torrentController');

// Download torrent
router.post('/download', downloadTorrent);

module.exports = router;
