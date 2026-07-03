// data/queries.js
import database from './model.js';

// GENERIC

const getSchedule = database.prepare(`
  SELECT * 
  FROM nfl_schedule
`);

// internal only
const addSchedule = database.prepare(`
  INSERT INTO nfl_schedule (week, start_datetime, cutoff_datetime)
  VALUES (?, ?, ?)
`);

// internal only
const clearSchedule = database.prepare(`
  DELETE FROM nfl_schedule;
`);

const getGameStates = database.prepare(`
  SELECT * 
  FROM game_states
`);

const updateGameStatesProcessedWeek = database.prepare(`
  UPDATE game_states
  SET last_processed_week = ?, updated_at = ?
`);

const updateGameStatesSurvivorFinished = database.prepare(`
  UPDATE game_states
  SET survivor_pool_outcome = ?, survivor_pool_winning_owners = ?, survivor_pool_winning_week = ?, updated_at = ?
`);

const resetDb_statements = [
  'DELETE FROM game_states;',
  'DELETE FROM survivor_pool_entry;',
  'DELETE FROM users;',
  'INSERT INTO game_states (updated_at) SELECT CURRENT_TIMESTAMP WHERE (SELECT COUNT(*) FROM game_states) = 0;'
].map(sql => database.prepare(sql));

// USER OPERATIONS

const createUser = database.prepare(`
  INSERT INTO users (user_email, username)
  VALUES (?, ?)
`);

const updateUsername = database.prepare(`
  UPDATE users
  SET username = ?
  WHERE user_email = ?
`);

const getUserByEmail = database.prepare(`
  SELECT * 
  FROM users 
  WHERE user_email = ?
`);

const getAllUsers = database.prepare(`
  SELECT user_email, username 
  FROM users
`);

// SURVIVOR POOL OPERATIONS

const createSurvivorPoolEntry = database.prepare(`
  INSERT INTO survivor_pool_entry (owner, week, choice_sleeper_id, choice_gm_name, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

const updateSurvivorPoolEntry = database.prepare(`
  UPDATE survivor_pool_entry 
  SET choice_sleeper_id = ?, choice_gm_name = ?, updated_at = ?
  WHERE owner = ? AND week = ?
`);

// internal only
const updateSurvivorPoolEntryOutcome = database.prepare(`
  UPDATE survivor_pool_entry 
  SET outcome = ?
  WHERE owner = ? AND week = ?
`);

const getAllSurvivorPoolEntries = database.prepare(`
  SELECT * 
  FROM survivor_pool_entry
`);

const getAllSurvivorPoolEntriesForWeek = database.prepare(`
  SELECT * 
  FROM survivor_pool_entry
  WHERE week = ?
`);

const getAllSurvivorPoolChoicesForUser = database.prepare(`
  SELECT choice_sleeper_id
  FROM survivor_pool_entry
  WHERE owner = ?
`);

// internal only
const getSurvivorPoolEntry = database.prepare(`
  SELECT * 
  FROM survivor_pool_entry
  WHERE owner = ? AND week = ?
`);

// PICKEMS OPERATIONS

/*
const deleteTodo = database.prepare(`
  DELETE from todos WHERE todo_id = ? AND todo_owner = ?  
`);
*/

export {
  resetDb_statements,
  // generic
  getSchedule,
  addSchedule,
  clearSchedule,
  getGameStates,
  updateGameStatesProcessedWeek,
  updateGameStatesSurvivorFinished,
  //users
  createUser,
  updateUsername,
  getUserByEmail,
  getAllUsers,
  //survivor pool
  createSurvivorPoolEntry,
  updateSurvivorPoolEntry,
  updateSurvivorPoolEntryOutcome,
  getAllSurvivorPoolEntries,
  getAllSurvivorPoolEntriesForWeek,
  getSurvivorPoolEntry,
  getAllSurvivorPoolChoicesForUser
  //pick ems
};