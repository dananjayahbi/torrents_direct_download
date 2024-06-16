// src/routes/torrentRoutes.js
const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const {
    downloadTorrent,
    uploadAndDownloadTorrent,
    zipDownloadedFiles
} = require('../controllers/torrentController');

// Multer setup for file uploads
const upload = multer({
    dest: path.join(__dirname, '..', 'uploads')
});

// Download torrent via magnet link
router.post('/download', downloadTorrent);

// Download torrent via file upload
router.post('/upload', upload.single('torrentFile'), uploadAndDownloadTorrent);

// Route to zip downloaded files
router.get('/zip/:sessionId', zipDownloadedFiles);

module.exports = router;
