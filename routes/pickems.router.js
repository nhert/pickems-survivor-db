import express from 'express';
import { getWinTotalsForWeek, getAllPickemsEntries, getAllPickemsEntriesForWeek, getPickemsEntry, deletePickemsEntry, createPickemsEntry, getPickemsScores } from '../data/queries.js';

const pickemsRouter = express.Router();

pickemsRouter.get('/entries/:week', (req, res) => {
    const week = req.params.week;
    if (!week) {
        return res.status(400).json({ error: 'Missing week param' });
    }
    const entries = getAllPickemsEntriesForWeek.all(week);

    return res.status(200).json(
        entries.map(({ owner, week, choice_sleeper_id, choice_gm_name, outcome, score, is_double_down, is_triple_down, is_auto_pick }) => ({
            owner,
            week,
            choice_sleeper_id,
            choice_gm_name,
            outcome,
            score,
            is_double_down,
            is_triple_down,
            is_auto_pick
        }))
    );
});

pickemsRouter.get('/scores', (req, res) => {
    const entries = getPickemsScores.all();

    return res.status(200).json(
        entries.map(({ owner, total_score }) => ({
            owner, total_score
        }))
    );
});

pickemsRouter.get('/delete/:email/:week/:sleeperId', (req, res) => {
    const email = req.params.email;
    const week = req.params.week;
    const sleeperId = req.params.sleeperId;

    if (!email || !week || !sleeperId) {
        return res.status(400).json({ error: 'Missing parameters' });
    }
    const deleteResult = deletePickemsEntry.run(email, week, sleeperId);
    const deleteCount = deleteResult.changes;
    if (deleteCount < 1) {
        return res.status(400).json({ error: 'Provided sleeperId in request body but row could not be deleted' });
    } else if (deleteCount > 1) {
        return res.status(400).json({ error: 'Provided sleeperId in request body and more than 1 row was deleted!' });
    }

    return res.status(200).json({
        message: 'User Pickems Entry successfully deleted'
    });
});

pickemsRouter.post('/make_pick/:email/:week', (req, res) => {
    // receive an entry with choice_sleeper_id, choice_gm_name body and add it for the email+week param
    // If existing sleeperid is provided in the request body, delete it before adding
    const email = req.params.email;
    const week = req.params.week;
    const { choice_sleeper_id, choice_gm_name } = req.body;

    if (!email || !week) {
        return res.status(400).json({ error: 'Missing parameters' });
    }
    if (!choice_sleeper_id || !choice_gm_name) {
        return res.status(400).json({ error: 'Missing request body' });
    }

    const updateTime = new Date().toISOString();

    // add new entry
    createPickemsEntry.run(email, week, choice_sleeper_id, choice_gm_name, 0, 0, 0, updateTime);
    return res.status(200).json({
        message: 'User Pickems Entry successfully updated'
    });
});

pickemsRouter.post('/make_bonus_pick/:email/:week', (req, res) => {
    const email = req.params.email;
    const week = req.params.week;
    const { choice_sleeper_id, choice_gm_name, is_double_down, is_triple_down } = req.body;

    if (!email || !week) {
        return res.status(400).json({ error: 'Missing parameters' });
    }
    if (!("is_double_down" in req.body) || !("is_triple_down" in req.body)) {
        return res.status(400).json({ error: 'Missing request body for double/triple' });
    }
    if (!choice_sleeper_id || !choice_gm_name) {
        return res.status(400).json({ error: 'Missing request body for sleeperId/gmName' });
    }

    const updateTime = new Date().toISOString();

    createPickemsEntry.run(email, week, choice_sleeper_id, choice_gm_name, is_double_down ? 1 : 0, is_triple_down ? 1 : 0, 0, updateTime);
    return res.status(200).json({
        message: 'User Pickems Entry Bonuses successfully updated'
    });
});

pickemsRouter.get('/underdogs/:week', (req, res) => {
    const week = req.params.week;
    if (!week) {
        return res.status(400).json({ error: 'Missing week parameter' });
    }
    if (week == 1) {
        return res.status(200).json({ warning: 'Underdogs cannot be calculated for week 1' });
    }

    const winTotals = getWinTotalsForWeek.all(week);
    return res.status(200).json(winTotals.map(({ sleeper_id, wins, losses, ties }) => ({
        sleeper_id, wins, losses, ties
    })));
});

export default pickemsRouter;