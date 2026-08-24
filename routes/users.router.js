// routes/users.router.js
import express from 'express';
import { createUser, getActivePickemsUsers, getAllUsers, getUserByEmail, updateUsername } from '../data/queries.js';

const usersRouter = express.Router();

// .../api/users/
usersRouter.post('/add', (req, res) => {
    const { email, username } = req.body;

    // Minimal Input Validation
    if (!email || !username) {
        return res.status(400).json({ error: 'Missing email or username parameter' });
    }

    const recordedUser = getUserByEmail.get(email);

    // User already exists, do not create new
    if (recordedUser)
        return res.status(400).json({ error: 'User already exists' });

    const newUser = createUser.run(email, username);

    return res
        .status(201)
        .json({
            message: 'User successfully created'
        });
});

usersRouter.get('/exists/:email', (req, res) => {
    const email = req.params.email;
    const recordedUser = getUserByEmail.get(email);

    var exists = false;

    if (!email) {
        return res.status(400).json({ error: 'Missing email parameter' });
    }
    if (recordedUser) {
        exists = true;
    }

    return res.status(200).json({
        exists: exists,
        email: email,
        username: recordedUser ? recordedUser.username : "Unknown"
    });
});

usersRouter.get('/get/:email', (req, res) => {
    const email = req.params.email;
    const recordedUser = getUserByEmail.get(email);

    if (!email) {
        return res.status(400).json({ error: 'Missing email parameter' });
    }
    if (!recordedUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }

    return res.status(200).json({
        email: email,
        username: recordedUser.username
    });
});

usersRouter.get('/all', (req, res) => {
    const recordedUsers = getAllUsers.all();
    const activePickemsEmails = getActivePickemsUsers.all();

    return res.status(200).json({
        gameUsers: recordedUsers.map(({ user_email, username, avatar_url, is_demo_user }) => ({
            user_email: user_email,
            username: username,
            avatar_url: avatar_url,
            is_demo_user: is_demo_user
        })),
        activeUsers: activePickemsEmails.map(({ email }) => ({
            user_email: email
        }))
    });
});

usersRouter.get('/usernames', (req, res) => {
    const recordedUsers = getAllUsers.all();
    return res.status(200).json(
        recordedUsers.map(user => user.username)
    );
});

usersRouter.post('/update/:email', (req, res) => {
    const email = req.params.email;
    const { username } = req.body;
    const recordedUser = getUserByEmail.get(email);

    if (!email) {
        return res.status(400).json({ error: 'Missing email parameter' });
    }
    if (!recordedUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }
    if (!username) {
        return res.status(400).json({ error: 'Missing username body' });
    }

    updateUsername.run(username, email);

    return res.status(200).json({
        message: 'Username successfully updated'
    });
});

export default usersRouter;