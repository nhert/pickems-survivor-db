// server.js
import express from 'express';
import cors from 'cors';
import { refreshSchedule } from './init-jobs/schedule.js';
import usersRouter from './routes/users.router.js';
import survivorPoolRouter from './routes/survivor_pool.router.js';
import genericRouter from './routes/generic.router.js';
import demoRouter from './routes/demo.router.js';
import pickemsRouter from './routes/pickems.router.js';

const PORT = 5000;
const app = express();

// node.js express features
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data (from HTML forms)
app.use(cors()); // allow cors communication

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