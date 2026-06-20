// Populates the db with some test data.

import { createUser, getAllUsernames, getUserByEmail, updateUsername, addSchedule } from './data/queries.js';

// datetime format ISO -> YYYY-MM-DD HH:MM:SS.SSS
// init the schedule
const scheduleEntries = [
    { week: 1, cutoff_datetime: '2026-09-09 12:00:00' },
    { week: 2, cutoff_datetime: '2026-09-17 12:00:00' },
    { week: 3, cutoff_datetime: '2026-09-24 12:00:00' },
    { week: 4, cutoff_datetime: '2026-10-01 12:00:00' },
]
scheduleEntries.forEach(element => {
    console.log("creating schedule: " + element.week);
    addSchedule.run(element.week, element.cutoff_datetime);
});

const sampleUsers = [
    { email: 'testuser1@b3fl.com', username: 'user1' },
    { email: 'testuser2@b3fl.com', username: 'user2' },
    { email: 'testuser3@b3fl.com', username: 'user3' },
    { email: 'testuser4@b3fl.com', username: 'user4' },
    { email: 'testuser5@b3fl.com', username: 'user5' },
]
// Create sample users
sampleUsers.forEach(element => {
    console.log("creating user: " + element.email);
    createUser.run(element.email, element.username);
});


// Create sample survivor pool entries

// etc