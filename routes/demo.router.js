import express from 'express';
import { runUpdate } from '../cron-jobs/update-db-score.js';
import { resetDatabaseToDefault } from '../data/reset-db.js';
import { genSamples } from "../example/sampledata.js";

const demoRouter = express.Router();

demoRouter.get('/next_week', async (req, res) => {
    await runUpdate();

    return res
        .status(200)
        .json({
            message: 'Server week updated for demo!'
        });
});

demoRouter.get('/reset', async (req, res) => {
    await resetDatabaseToDefault();
    await genSamples();

    return res
        .status(200)
        .json({
            message: 'Server has been reset!'
        });
});

export default demoRouter;