// server.js
import express from 'express';
import cors from 'cors';
import { refreshSchedule } from './init-jobs/schedule.js';
import usersRouter from './routes/users.router.js';
import survivorPoolRouter from './routes/survivor_pool.router.js';
import genericRouter from './routes/generic.router.js';
import demoRouter from './routes/demo.router.js';
import pickemsRouter from './routes/pickems.router.js';
import { httpLogger } from './logging/requestLoggingHandler.js'
import { updateAvatarUrl } from './data/queries.js';
// image upload related
import path from 'node:path';
import multer from 'multer';
import * as fs from 'node:fs';
import sharp from 'sharp';

const PORT = 5000;
const app = express();
const __dirname = import.meta.dirname;

// node.js express features
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data (from HTML forms)
app.use(cors()); // allow cors communication

// Log all traffic in the requests.log file
app.use(httpLogger);

// File handling
const uploadDir = path.join(__dirname, 'avatar_uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer disk storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'avatar_uploads/');
//     },
//     filename: (req, file, cb) => {
//         const defaultName = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const customName = req.params.email || defaultName;
//         const ext = path.extname(file.originalname);

//         cb(null, `${customName}${ext}`);
//     }
// });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// The route string 'image' must match the Angular FormData key
app.post('/api/upload_avatar/:email', upload.single('image'), async (req, res) => {
    try {

        const email = req.params.email;
        if (!email) {
            return res.status(400).json({ error: 'Missing email parameter' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Set avatar filename to user email .png
        const finalFilename = `${email}.png`;
        const outputPath = path.join(uploadDir, finalFilename);

        await sharp(req.file.buffer)
            .png({
                quality: 90,
                compressionLevel: 6,
                effort: 1
            }) // Convert & optimize to PNG format
            .toFile(outputPath);

        const avatarUrl = `/avatars/${finalFilename}`;
        updateAvatarUrl.run(avatarUrl, email);

        res.status(200).json({
            message: 'Avatar saved successfully!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error while processing avatar');
    }
});

// api routes
app.use('/api/', genericRouter);
app.use('/api/users', usersRouter);
app.use('/api/survivor_pool', survivorPoolRouter);
app.use('/api/pickems', pickemsRouter);

// TODO: comment this out for production
app.use('/api/demo', demoRouter);

// refresh the schedule table on startup from json data.
refreshSchedule();

console.log("\nStarting server...");
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));