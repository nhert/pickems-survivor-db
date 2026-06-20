// server.js
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.router.js';
import survivorPoolRouter from './routes/survivor_pool.router.js';
import genericRouter from './routes/generic.router.js';

const PORT = 5000;
const app = express();

app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data (from HTML forms)
app.use(cors()); // allow cors communication

app.use('/api/', genericRouter);
app.use('/api/users', usersRouter);
app.use('/api/survivor_pool', survivorPoolRouter);
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));