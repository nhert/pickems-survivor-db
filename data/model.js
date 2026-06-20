import { DatabaseSync } from 'node:sqlite';

const database = new DatabaseSync(`${import.meta.dirname}/main.db`);

const initDatabase = `
CREATE TABLE IF NOT EXISTS users (
    user_email TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nfl_schedule (
    -- sleepers getNflState will flip to the next week on tuesday night to allow stat corrections (2-3am)
    week INTEGER NOT NULL,

    -- this is the time that entries for both pickem/survivor pool are cutoff each nfl week
    -- most weeks this will be thursday, but a couple weeks this season its wednesday
    cutoff_datetime DATETIME NOT NULL

);

CREATE TABLE IF NOT EXISTS survivor_pool_entry (
    owner TEXT NOT NULL,

    -- week can be a value from 1-14 (pool ends before the fantasy playoffs)
    week INTEGER NOT NULL,

    -- Sleeper ID of the GM that was chosen for this weeks survivor pool. Used to match results from sleepers API to check win/loss.
    choice_sleeper_id TEXT NOT NULL,

    -- Name of the GM that was chosen for this weeks survivor pool, from Constants. Mostly for display
    choice_gm_name TEXT NOT NULL,

    -- useful date records for auditing
    updated_at TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (owner, week),
    FOREIGN KEY (owner) REFERENCES users (user_email)
);

CREATE TABLE IF NOT EXISTS survivor_pool_state (
    owner TEXT NOT NULL,
    eliminated BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (owner),
    FOREIGN KEY (owner) REFERENCES users (user_email)
);

--CREATE TABLE IF NOT EXISTS pick_ems (
--);
`;

database.exec(initDatabase);

export default database;