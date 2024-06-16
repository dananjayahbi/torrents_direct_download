// src/controllers/torrentController.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { AbortController } = require('abort-controller');

const sanitizeFilename = (filename) => {
    // Remove characters not supported by file systems
    return filename.replace(/[\/\\:*?"<>|]/g, '-');
};

async function downloadFiles(torrent, downloadDir, abortSignal) {
    return new Promise((resolve, reject) => {
        const downloadPromises = torrent.files.map(file => {
            const sanitizedFilename = sanitizeFilename(file.path);
            const torrentFilePath = path.join(downloadDir, sanitizedFilename);
            const fileWriteStream = fs.createWriteStream(torrentFilePath);

            return new Promise((resolve, reject) => {
                const stream = file.createReadStream();

                const onAbort = () => {
                    stream.destroy();
                    fileWriteStream.destroy();
                    reject(new Error('Download aborted'));
                };

                abortSignal.addEventListener('abort', onAbort);

                fileWriteStream.on('finish', () => {
                    abortSignal.removeEventListener('abort', onAbort);
                    resolve();
                });
                fileWriteStream.on('error', (error) => {
                    abortSignal.removeEventListener('abort', onAbort);
                    reject(error);
                });

                stream.pipe(fileWriteStream);
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
    const abortController = new AbortController();

    req.on('close', () => {
        console.log('Request canceled');
        abortController.abort();
    });

    try {
        // Use dynamic import() for WebTorrent
        const WebTorrent = (await import('webtorrent')).default;
        const client = new WebTorrent();

        const torrent = await client.add(magnetLink);

        // Listen for progress events
        torrent.on('download', (bytes) => {
            const percent = (torrent.progress * 100).toFixed(2);
            console.log(`Downloaded: ${percent}%`);
        });

        // Create a unique folder for the download session
        const sessionId = uuidv4();
        const downloadDir = path.join(__dirname, '..', 'downloads', sessionId);

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
        await downloadFiles(torrent, downloadDir, abortController.signal);

        // Destroy the client instance
        client.destroy();

        res.json({ message: 'Torrent downloaded successfully', downloadDir });
    } catch (error) {
        console.error('Error downloading torrent:', error);
        res.status(500).json({ message: error.message || 'Failed to download torrent' });
    }
};
