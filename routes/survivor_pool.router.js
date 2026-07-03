import express from 'express';
import { createSurvivorPoolEntry, getAllSurvivorPoolChoicesForUser, getAllSurvivorPoolEntries, getSurvivorPoolEntry, getUserByEmail, updateSurvivorPoolEntry } from '../data/queries.js';

const survivorPoolRouter = express.Router();

// .../api/survivor_pool/
// survivorPoolRouter.post('/add', (req, res) => {
//     const { email, week, choice_sleeper_id, choice_gm_name } = req.body;

//     // Minimal Input Validation
//     if (!email || !week || !choice_sleeper_id || !choice_gm_name) {
//         return res.status(400).json({ error: 'Missing parameters' });
//     }

//     const recordedEntry = getSurvivorPoolEntry.get(email, week);
//     const recordedUser = getUserByEmail.get(email);

//     // User already exists, do not create new
//     if (recordedEntry)
//         return res.status(400).json({ error: 'Survivor Pool entry for email+week already exists' });
//     if (!recordedUser)
//         return res.status(400).json({ error: 'User does not exist' });

//     const updateTime = new Date().toISOString();
//     const newEntry = createSurvivorPoolEntry.run(email, week, choice_sleeper_id, choice_gm_name, updateTime);

//     return res
//         .status(201)
//         .json({
//             message: 'User Survivor Pool Entry successfully created'
//         });
// });

// will either create or update based on existing records
survivorPoolRouter.post('/update/:email/:week', (req, res) => {
    const email = req.params.email;
    const week = req.params.week;
    const { choice_sleeper_id, choice_gm_name } = req.body;
    const recordedEntry = getSurvivorPoolEntry.get(email, week);
    const recordedUser = getUserByEmail.get(email);

    if (!email || !week) {
        return res.status(400).json({ error: 'Missing parameters' });
    }
    if (!choice_sleeper_id || !choice_gm_name) {
        return res.status(400).json({ error: 'Missing request body' });
    }
    if (!recordedUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }

    const updateTime = new Date().toISOString();

    if (!recordedEntry) { // No existing entry, create one.
        createSurvivorPoolEntry.run(email, week, choice_sleeper_id, choice_gm_name, updateTime);
        return res.status(200).json({
            message: 'User Survivor Pool Entry successfully created'
        });
    } else {
        updateSurvivorPoolEntry.run(choice_sleeper_id, choice_gm_name, updateTime, email, week);
        return res.status(200).json({
            message: 'User Survivor Pool Entry successfully updated'
        });
    }
});

/*
Get All Survivor Pool Entries
Estimated max size in worst case scenario: 26ownersx14weeks = 364 rows
*/
survivorPoolRouter.get('/entries', (req, res) => {
    const recordedEntries = getAllSurvivorPoolEntries.all();
    return res.status(200).json(
        recordedEntries.map(({ owner, week, choice_sleeper_id, choice_gm_name, outcome }) => ({
            owner,
            week,
            choice_sleeper_id,
            choice_gm_name,
            outcome
        }))
    );
});

survivorPoolRouter.get('/choices/:email', (req, res) => {
    const email = req.params.email;
    if (!email) {
        return res.status(400).json({ error: 'Missing user email parameter' });
    }

    const recordedEntries = getAllSurvivorPoolChoicesForUser.all(email);
    return res.status(200).json(
        recordedEntries.map(({ choice_sleeper_id }) => ({
            choice_sleeper_id
        }))
    );
});

export default survivorPoolRouter;