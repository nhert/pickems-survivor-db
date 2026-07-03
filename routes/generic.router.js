import express from 'express';
import { getSchedule, getGameStates } from '../data/queries.js';

const genericRouter = express.Router();

genericRouter.get('/status', (req, res) => {
    const gameStates = getGameStates.get();

    return res
        .status(200)
        .json({
            message: 'Game Server is live!'
        });
});

genericRouter.get('/time', (req, res) => {
    return res
        .status(200)
        .json({
            server_time: new Date().toISOString()
        });
});

genericRouter.get('/schedule', (req, res) => {
    const scheduleEntries = getSchedule.all();
    if (!scheduleEntries) {
        return res.status(400).json({ error: 'No schedule found!' });
    }

    return res.status(200).json(
        scheduleEntries.map(({ week, start_datetime, cutoff_datetime }) => ({
            week,
            start_datetime,
            cutoff_datetime
        }))
    );
});

genericRouter.get('/game_states', (req, res) => {
    const states = getGameStates.get();
    if (!states) {
        return res.status(400).json({ error: 'No game states found!' });
    }

    return res.status(200).json({
        last_processed_week: states.last_processed_week,
        survivor_pool_outcome: states.survivor_pool_outcome,
        survivor_pool_winning_owners: states.survivor_pool_winning_owners
    });
});

export default genericRouter;