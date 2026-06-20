import express from 'express';
import { getSchedule } from '../data/queries.js';

const genericRouter = express.Router();

genericRouter.get('/status', (req, res) => {
    return res
        .status(200)
        .json({
            message: 'Game Server is live!'
        });
});

genericRouter.get('/schedule/:week', (req, res) => {
    const week = req.params.week;
    if (!week) {
        return res.status(400).json({ error: 'Missing week parameter' });
    }

    const scheduleEntry = getSchedule.get(week);
    if (!scheduleEntry) {
        return res.status(400).json({ error: 'No schedule entry for requested week!' });
    }

    return res.status(200).json({
        week: scheduleEntry.week,
        cutoff_datetime: scheduleEntry.cutoff_datetime
    });
});

export default genericRouter;