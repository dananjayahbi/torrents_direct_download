// src/routes/torrentRoutes.js
const router = require('express').Router();
const multer = require('multer');
const path = require('path');

// Ensure the import includes zipDownloadFiles
const {
    downloadTorrent,
    uploadAndDownloadTorrent,
    zipDownloadFiles // Ensure this is imported
} = require('../controllers/torrentController');

// Multer setup for file uploads
const upload = multer({
    dest: path.join(__dirname, '..', 'uploads')
});

// Download torrent via magnet link
router.post('/download', downloadTorrent);

// Download torrent via file upload
router.post('/upload', upload.single('torrentFile'), (req, res, next) => {
    // Check if the uploaded file has a .torrent extension before proceeding
    if (path.extname(req.file.originalname) !== '.torrent') {
        return res.status(400).json({ error: 'Invalid file format. Only .torrent files are allowed.' });
    }
    uploadAndDownloadTorrent(req, res, next);
});

// Route to zip downloaded files
router.post('/zip', zipDownloadFiles); // Ensure this is correctly used

module.exports = router;
