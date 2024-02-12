// src/controllers/torrentController.js
const fs = require('fs');
const path = require('path');

const sanitizeFilename = (filename) => {
    // Remove characters not supported by file systems
    return filename.replace(/[\/\\:*?"<>|]/g, '-');
};

async function downloadFiles(torrent, downloadDir) {
    return new Promise((resolve, reject) => {
        const downloadPromises = torrent.files.map(file => {
            const sanitizedFilename = sanitizeFilename(file.path);
            const torrentFilePath = path.join(downloadDir, sanitizedFilename);
            const fileWriteStream = fs.createWriteStream(torrentFilePath);

            return new Promise((resolve, reject) => {
                file.createReadStream().pipe(fileWriteStream);
                fileWriteStream.on('finish', resolve);
                fileWriteStream.on('error', reject);
            });
        });

        Promise.all(downloadPromises)
            .then(resolve)
            .catch(reject);
    });
}

// Controller method
exports.downloadTorrent = async (req, res) => {
    const { magnetLink } = req.body;

    try {
        // Use dynamic import() for WebTorrent
        const WebTorrent = (await import('webtorrent')).default;
        const client = new WebTorrent();

        const torrent = await client.add(magnetLink);

        const downloadDir = path.join(__dirname, '..', 'downloads');

        // Ensure the downloads directory exists
        fs.mkdirSync(downloadDir, { recursive: true });

        let retries = 0;
        const maxRetries = 5;
        const retryDelay = 2000; // 2 seconds

        async function checkFiles() {
            if (torrent.files && torrent.files.length > 0) {
                return;
            }

            if (retries < maxRetries) {
                retries++;
                console.log(`Retrying (${retries}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                await checkFiles(); // Recursive call to retry
            } else {
                throw new Error('Maximum retries reached. Torrent does not contain any files.');
            }
        }

        await checkFiles();

        // Download files
        await downloadFiles(torrent, downloadDir);

        // Destroy the client instance
        client.destroy();

        res.json({ message: 'Torrent downloaded successfully' });
    } catch (error) {
        console.error('Error downloading torrent:', error);
        res.status(500).json({ message: error.message || 'Failed to download torrent' });
    }
};
