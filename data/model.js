import { DatabaseSync } from 'node:sqlite';

const database = new DatabaseSync(`${import.meta.dirname}/main.db`);

const initDatabase = `
CREATE TABLE IF NOT EXISTS users (
    user_email TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- this gets mixed in with nflState from sleeper to represent the game schedule
CREATE TABLE IF NOT EXISTS nfl_schedule (

    -- sleepers getNflState will flip to the next week on tuesday night to allow stat corrections (2-3am)
    week INTEGER NOT NULL,

    -- Midnight Monday->Tuesday each week
    start_datetime DATETIME NOT NULL,

    -- this is the time that entries for both pickem/survivor pool are cutoff each nfl week
    -- most weeks this will be thursday, but a couple weeks this season its wednesday
    cutoff_datetime DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS game_states (

    -- useful date records for auditing
    updated_at TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Last week that the cron job has run to update the w/l of survivor and pickems picks
    last_processed_week INTEGER NOT NULL DEFAULT 0 CHECK(last_processed_week BETWEEN 0 AND 14),

    -- Survivor Pool is won if one player stands alone with a correct pick while everyone else is eliminated
    -- Survivor Pool is tied if all remaining players bust, with no remaining correct pick
    -- Survivor Pool outcome is UNKNOWN while there are multiple players alive
    survivor_pool_outcome TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK(survivor_pool_outcome IN ('WON', 'TIE', 'UNKNOWN')),

    -- Comma separated list of winning emails (in the case of a tie that splits the pot). Just for display
    survivor_pool_winning_owners TEXT,
    -- Week that the Pool was won, for display purposes. 
    survivor_pool_winning_week NUMBER
);

-- Initialize game states to default values if the record does not exist
INSERT INTO game_states (updated_at) 
SELECT CURRENT_TIMESTAMP
WHERE (SELECT COUNT(*) FROM game_states) = 0;

CREATE TABLE IF NOT EXISTS survivor_pool_entry (

    owner TEXT NOT NULL,

    -- week can be a value from 1-14 (pool ends before the fantasy playoffs)
    week INTEGER NOT NULL,

    -- Sleeper ID of the GM that was chosen for this weeks survivor pool. Used to match results from sleepers API to check win/loss.
    choice_sleeper_id TEXT NOT NULL,

    -- Name of the GM that was chosen for this weeks survivor pool, from Constants. Mostly for display
    choice_gm_name TEXT NOT NULL,

    -- Win / Loss / Unknown (still pending)
    -- Win/Loss only assigned to 100% completed weeks (rotates wednesday at 1:00am)
    -- Unknown assigned to incomplete weeks (UI loads sleeper score live)
    -- This value is only ever set by Cron Job scripts / manually triggered scripts
    outcome TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK(outcome IN ('WIN', 'LOSS', 'TIE', 'MISSED', 'UNKNOWN')),

    -- useful date records for auditing
    updated_at TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (owner, week),
    FOREIGN KEY (owner) REFERENCES users (user_email)
);

--CREATE TABLE IF NOT EXISTS pick_ems (
--);
`;

database.exec(initDatabase);

export default database;