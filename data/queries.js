// data/queries.js
import database from './model.js';

// GENERIC

const getSchedule = database.prepare(`
  SELECT * 
  FROM nfl_schedule
  WHERE week = ?
`);

// internal only
const addSchedule = database.prepare(`
  INSERT INTO nfl_schedule (week, cutoff_datetime)
  VALUES (?, ?)
`);

// internal only
const clearSchedule = database.prepare(`
  DELETE FROM nfl_schedule;
`);

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

const getAllUsernames = database.prepare(`
  SELECT username 
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

const getAllSurvivorPoolEntries = database.prepare(`
  SELECT * 
  FROM survivor_pool_entry
`);

// internal only
const getSurvivorPoolEntry = database.prepare(`
  SELECT * 
  FROM survivor_pool_entry
  WHERE owner = ? AND week = ?
`);

const getSurvivorPoolStates = database.prepare(`
  SELECT * 
  FROM survivor_pool_state
`);

// PICKEMS OPERATIONS

/*
const deleteTodo = database.prepare(`
  DELETE from todos WHERE todo_id = ? AND todo_owner = ?  
`);
*/

export {
  // generic
  getSchedule,
  addSchedule,
  clearSchedule,
  //users
  createUser,
  updateUsername,
  getUserByEmail,
  getAllUsernames,
  //survivor pool
  createSurvivorPoolEntry,
  updateSurvivorPoolEntry,
  getAllSurvivorPoolEntries,
  getSurvivorPoolEntry,
  getSurvivorPoolStates
  //pick ems
};