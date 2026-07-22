import { getActivePickemsUsers, getNumberOfWinsForUserUpToWeek, addOrUpdateSleeperWinLossMatrixEntry, getAllSurvivorPoolEntriesForWeek, getGameStates, updateSurvivorPoolEntryOutcome, updateGameStatesProcessedWeek, updateGameStatesSurvivorFinished, createSurvivorPoolEntry, createMissedSurvivorPoolEntry, getAllPickemsEntriesForWeek, updatePickemsEntryOutcomeAndScore, createPickemsEntry } from '../data/queries.js';
import { getSleeperMatchupsForWeek } from '../sleeper/sleeper-api.js';
import { logger } from '../logging/logging.js'

const EXPECTED_MATCHUPS_PER_WEEK = 13;

const SCORE_WIN = 2;
const SCORE_UNDERDOG_WIN = 3;

const SCORE_DOUBLE_DOWN_LOSS = -2;
const SCORE_TRIPLE_DOWN_LOSS = -3;

// params: boolean, number
export async function runUpdate(manualOverride, forceSurvivorProcessing, week) {
    printSectionLogMessage("UPDATE-DB-SCORE.JS EXECUTION");

    // Need to get the last week we ran the update for. Stored in game_states
    const game_states = getGameStates.get();
    if (!game_states) {
        logger.error("Could not find game_states");
        return;
    }

    // If running manually with a specific week, run the update for that week. 
    // Otherwise if week is null, get the last processed week from DB and do + 1 to process the latest week.
    const week_to_update = week ?? game_states.last_processed_week + 1;
    logger.info(`Running update-db-score.js for week [${week_to_update}] at ${new Date().toISOString()}`);
    if (week_to_update > 14) {
        logger.warn("Skipping update-db-score.js since week is out of range (>14)");
        return;
    }
    logger.info(`GameStates = ${JSON.stringify(game_states)}`);

    // Need to get all the Pickems entries for the current week 
    // const pickemsEntriesForWeek = ...

    // Get all matchups from the current sleeper week to determine w/l for each gm
    // builds an array of json with properties: sleeperId, outcome
    /*
    [
    { sleeperId: '867479730138583040', outcome: 'LOSS' },
    { sleeperId: '998276027312889856', outcome: 'WIN' },
    { sleeperId: '867562511770255360', outcome: 'WIN' },
    ....
    ]
    */
    logger.info(`Running getSleeperMatchupsForWeek() with week [${week}]`);
    const sleeperMatchupData = await getSleeperMatchupsForWeek(week_to_update);
    if (!sleeperMatchupData || !sleeperMatchupData.winLoss || !sleeperMatchupData.matchups) {
        logger.error("Got a null value while checking sleeper matchups!");
        return;
    }
    logger.info(`Found [${sleeperMatchupData.matchups.length}] matchups for this week`);

    const winLoss = sleeperMatchupData.winLoss;
    const matchups = sleeperMatchupData.matchups;
    //console.log(winLoss);
    //console.log(matchups);

    // update win-loss matrix table so we can calculate / recalculate underdog status for players for any input week during the season
    printSectionLogMessage("WIN/LOSS MATRIX UPDATES");
    updateSleeperWinLossMatrixTable(week_to_update, winLoss);

    // Logic to update survivor pool entries.
    // Need to get all the Survivor Pool entries for the current week 
    printSectionLogMessage("SURVIVOR POOL PROCESSING");
    if (forceSurvivorProcessing || game_states.survivor_pool_outcome == "UNKNOWN") {
        logger.info("Running survivor pool processing. Forced? = " + forceSurvivorProcessing);
        let succeeded = processSurvivorPool(winLoss, game_states, week_to_update);
        if (!succeeded) {
            logger.error(`Survivor pool processing FAILED for week [${week_to_update}]`);
        }
    } else {
        logger.info("Skipping survivor pool processing, pool is finished");
    }

    printSectionLogMessage("PICKEMS PROCESSING");
    // use the array from above to determine outcome for each pickems entry
    let succeeded = processPickems(winLoss, matchups, week_to_update);
    if (!succeeded) {
        logger.error(`Pickems processing FAILED for week [${week_to_update}]`);
    }

    printSectionLogMessage("LAST PROCESSED WEEK");
    // Update game_states last processed week 
    if (!manualOverride) {
        logger.info(`Setting last processed week to [${week_to_update}]`);
        updateGameStatesProcessedWeek.run(week_to_update, new Date().toISOString());
    } else {
        logger.info(`Skipping update to last processed week - update ran with manual override`);
    }
}

function updateSleeperWinLossMatrixTable(week_to_update, winLoss) {
    for (var result of winLoss) {
        logger.info(`Updated WinLoss Matrix outcome for sleeperId [${result.sleeperId}], set to [${result.outcome}] for week [${week_to_update}]`);
        addOrUpdateSleeperWinLossMatrixEntry.run(result.sleeperId, week_to_update, result.outcome);
    }
}

function processSurvivorPool(winLoss, game_states, week_to_update) {
    const survivorEntriesForWeek = getAllSurvivorPoolEntriesForWeek.all(week_to_update);
    if (survivorEntriesForWeek) {
        //console.log(survivorEntriesForWeek);

        // use the matchups array from above to determine outcome for each survivor entry
        let successfulUpdateCount = 0;
        for (var entry of survivorEntriesForWeek) {
            if (entry.outcome == "MISSED") {
                // note: missed entries will never have their result changed by stat corrections or otherwise. If user somehow has a mistaken MISSED entry, will have to be fixed manually in the DB.
                console.warn(`Skipping outcome resolution for ${entry.owner} for week ${week_to_update} since it is outcome MISSED`);
                continue;
            }
            var matchupResult = winLoss.find(obj => obj.sleeperId == entry.choice_sleeper_id);
            logger.info(`Setting survivor pool outcome for ${entry.owner} for week ${week_to_update} to [${matchupResult.outcome}]`);
            entry.outcome = matchupResult.outcome;
            const updateResult = updateSurvivorPoolEntryOutcome.run(matchupResult.outcome, entry.owner, entry.week);
            successfulUpdateCount += updateResult.changes;
        }

        const countOfNonMissedEntries = survivorEntriesForWeek.filter(entry => entry.outcome != "MISSED").length;
        logger.info(`[${successfulUpdateCount}] rows successfully updated for entry count of [${countOfNonMissedEntries}]`);
        if (countOfNonMissedEntries != successfulUpdateCount) {
            logger.error("Mismatch between number of successful row updates and number of entries to update - script needs to be run again");
            return false;
        }

        checkForMissedEntries(survivorEntriesForWeek, week_to_update, game_states);
        determineSurvivorPoolGameEndState(survivorEntriesForWeek, week_to_update, game_states);
        return true;
    } else {
        logger.error(`Could not find any survivor entries for week ${week_to_update}`);
        return false;
    }
}

// After week 1, if a player has winning entries, but then misses a weeks submission, need to mark them as eliminated by inserting a MISSED survivor pool entry for them.
// If a user misses the week 1 submission, they will be appropriately blocked in the UI from making any future submissions already.
function checkForMissedEntries(survivorEntriesForWeek, week_to_update, game_states) {
    if (week_to_update == 1) {
        logger.warn(`Skipping checkForMissedEntries processing since it is week 1`);
        return;
    }
    logger.info(`Running checkForMissedEntries for week [${week_to_update}]`);

    // step 1 get list of emails who were not eliminated last week (they should be making an entry this week)
    const lastWeek = (+week_to_update) - 1;
    const survivorEntriesForLastWeek = getAllSurvivorPoolEntriesForWeek.all(lastWeek);
    if (!survivorEntriesForLastWeek) {
        logger.error(`Skipping checkForMissedEntries processing since last weeks entries could not be found`);
        return;
    }
    const winnersLastWeekEmailsArray = survivorEntriesForLastWeek.filter(obj => obj.outcome == "WIN" || obj.outcome == "TIE").map(entry => entry.owner);

    // step 2 match the list of people who are still alive to the list of people who made submissions this week and get a list of missing emails.
    const submissionsThisWeekEmailsArray = survivorEntriesForWeek.map(entry => entry.owner);
    const missingEmails = winnersLastWeekEmailsArray.filter(item => !submissionsThisWeekEmailsArray.includes(item));

    if (missingEmails.length > 0) {
        logger.info(`Found players with missing submissions this week ${missingEmails}`);
    }

    for (var email of missingEmails) {
        logger.info(`Setting outcome for ${email} for week ${week_to_update} to [MISSED]! Shame!`);
        createMissedSurvivorPoolEntry.run(email, week_to_update, new Date().toISOString());
    }
}

function determineSurvivorPoolGameEndState(entries, week, game_states) {
    const unknownEntries = entries.filter(obj => obj.outcome === "UNKNOWN");
    const winningEntries = entries.filter(obj => obj.outcome === "WIN" || obj.outcome === "TIE");
    const losingEntries = entries.filter(obj => obj.outcome === "LOSS");
    const numWinners = winningEntries.length;

    if (unknownEntries.length > 0) {
        logger.error("Trying to run determineSurvivorPoolGameEndState on entries that have UNKNOWN outcome.");
        return;
    }

    logger.info(`There were [${numWinners}] winners in survivor pool this week`);

    const winners = getListOfPlayerEmailsFromEntries(winningEntries);
    const losers = getListOfPlayerEmailsFromEntries(losingEntries);

    if (numWinners == 1) { // game over, someone won
        updateGameStatesSurvivorFinished.run("WON", winners, week, new Date().toISOString());
        logger.info(`Survivor Pool has been won by one person! Congratulations, ${winners}`);
    } else if (numWinners == 0) { // game over, it was a tie between multiple people who got eliminated at once
        updateGameStatesSurvivorFinished.run("TIE", losers, week, new Date().toISOString());
        logger.info(`Survivor Pool has been tied by ${losingEntries.length} people! Congratulations, ${losers}`);
    } else if (week == 14) { // Reached end of season, and more than 1 person won week 14. Winners all tie.
        updateGameStatesSurvivorFinished.run("TIE", winners, week, new Date().toISOString());
        logger.info(`Survivor Pool has reached end of week 14 with multiple winners! Congratulations, ${winners}`);
    } else { // otherwise, the game continues
        if (game_states.survivor_pool_outcome != "UNKNOWN") {
            // In the case where something goes wrong and breaks game state, need to allow it to reset back to UNKNOWN on manual run.
            updateGameStatesSurvivorFinished.run("UNKNOWN", null, null, new Date().toISOString());
            logger.info("Survivor Pool game state has been reset to UNKNOWN");
        } else {
            logger.info(`Game outcome of Survivor Pool is still UNKNOWN`);
        }
    }
}

function getListOfPlayerEmailsFromEntries(filteredEntries) {
    const emailsArray = [];
    for (var entry of filteredEntries) {
        emailsArray.push(entry.owner);
    }

    return emailsArray.join(",");
}

function processPickems(winLoss, matchups, week_to_update) {
    // auto picks assigned, will be added and picked up by pickemsEntriesForWeek right after this.
    assignAutoPicksForUsers(matchups, week_to_update);

    // get entries for all users for current week
    const pickemsEntriesForWeek = getAllPickemsEntriesForWeek.all(week_to_update);

    // sort entries so that the appear in a nice order for logging / auditing.
    pickemsEntriesForWeek.sort((a, b) => a.owner.localeCompare(b.owner));

    if (pickemsEntriesForWeek) {
        //console.log(pickemsEntriesForWeek);

        // use the matchups array from above to determine outcome for each survivor entry
        let successfulUpdateCount = 0;
        for (var entry of pickemsEntriesForWeek) {

            var matchupResult = winLoss.find(obj => obj.sleeperId == entry.choice_sleeper_id);
            entry.outcome = matchupResult.outcome;
            logger.info(`Setting pickems outcome for ${entry.owner} for week ${week_to_update} to [${matchupResult.outcome}]`);

            // get underdog status
            let isUnderdogPick = determineUnderdog(week_to_update, matchupResult.sleeperId, matchupResult.sleeperId_opponent);

            let isDouble = entry.is_double_down;
            let isTriple = entry.is_triple_down;
            let isAuto = entry.is_auto_pick;

            // get score
            let scoreCalc = calculateScore(matchupResult.outcome, isUnderdogPick, isDouble, isTriple, isAuto);

            logger.info(`\t> underdog? [${isUnderdogPick}] double down? [${isDouble ? 'yes' : 'no'}] triple down? [${isTriple ? 'yes' : 'no'}] AUTO pick? [${isAuto ? 'yes' : 'no'}] score total is ${scoreCalc}!`)

            const updateResult = updatePickemsEntryOutcomeAndScore.run(matchupResult.outcome, scoreCalc, entry.owner, entry.week, entry.choice_sleeper_id);
            successfulUpdateCount += updateResult.changes;
        }

        const countEntries = pickemsEntriesForWeek.length;
        logger.info(`[${successfulUpdateCount}] rows successfully updated for entry count of [${countEntries}]`);
        if (countEntries != successfulUpdateCount) {
            logger.error("Mismatch between number of successful row updates and number of entries to update - script needs to be run again");
            return false;
        }

        return true;
    } else {
        logger.error(`Could not find any pickems entries for week ${week_to_update}`);
        return false;
    }
}

// for users actively playing pickems, assign auto picks if they missed any
function assignAutoPicksForUsers(matchups, week_to_update) {
    // get list of active users and get all current entries for week
    const pickemsEntriesForWeekPreAutoAssign = getAllPickemsEntriesForWeek.all(week_to_update);
    const activeUsers = getActivePickemsUsers.all(); // defined as having one pickems entry != auto

    // create list of what auto picks will automatically be made for everyone who missed one with a list of sleeperIds
    const autoPicksForWeek = [];
    for (var matchup of matchups) {
        const player1 = matchup[0];
        const player2 = matchup[1];
        const player1_isUnderdog = determineUnderdog(week_to_update, player1.userId, player2.userId);
        const player2_isUnderdog = determineUnderdog(week_to_update, player2.userId, player1.userId);

        if (player1_isUnderdog) {
            autoPicksForWeek.push(player1.userId);
        } else if (player2_isUnderdog) {
            autoPicksForWeek.push(player2.userId);
        } else { // even matchup, assign randomly
            const randomIndexChoice = Math.round(Math.random());
            const playerRandom = matchup[randomIndexChoice];
            //console.log("even matchup for auto pick, chose " + randomIndexChoice);
            autoPicksForWeek.push(playerRandom.userId);
        }
    }

    if (autoPicksForWeek.length != EXPECTED_MATCHUPS_PER_WEEK) {
        logger.error("The calculated autopicks array is not equal to the number of matchups for the week");
        return;
    }

    const updateTime = new Date().toISOString();

    for (var user of activeUsers) {
        const email = user.email;
        const userEntriesForWeek = pickemsEntriesForWeekPreAutoAssign.filter(obj => obj.owner == email);
        const userRecordCountForThisWeek = userEntriesForWeek.length;

        // user has less than the expected number of pickems entries for this week, assign them auto picks for missing entries
        if (userRecordCountForThisWeek < EXPECTED_MATCHUPS_PER_WEEK) {
            logger.info(`[${EXPECTED_MATCHUPS_PER_WEEK - userRecordCountForThisWeek}] AUTO picks will be assigned for user ${email}`);

            // Go thru the matchups for this week and one-by-one determine if user made a pick on that matchup
            // otherwise, assign auto pick
            for (var matchup of matchups) {
                const player1 = matchup[0];
                const player2 = matchup[1];

                // does user have an entry for one of the sleeperIds in this matchup?
                const matchupEntry = userEntriesForWeek.find(obj => obj.choice_sleeper_id == player1.userId || obj.choice_sleeper_id == player2.userId);
                if (!matchupEntry) { // if not, assign auto pick for this matchup
                    const autoPickId = autoPicksForWeek.find(pick => pick == player1.userId || pick == player2.userId);
                    logger.info(`Making AUTO pick of ${autoPickId} for user ${email}`);
                    createPickemsEntry.run(email, week_to_update, autoPickId, 'AUTO-PICK', 0, 0, 1, updateTime);
                }
            }
        }
    }

}

function determineUnderdog(week_to_update, choice_sleeper_id, choice_opponent_sleeper_id) {
    // In week 1, there are no underdogs.
    if (week_to_update == 1) {
        return false;
    }
    if (!choice_sleeper_id || !choice_opponent_sleeper_id) {
        logger.error(`One of sleeperId or opponent sleeperId was undefined! choice = [${choice_sleeper_id}] opponent = [${choice_opponent_sleeper_id}]`);
        return false;
    }

    const choice_wins = getNumberOfWinsForUserUpToWeek.get(choice_sleeper_id, week_to_update).wins;
    const opponent_wins = getNumberOfWinsForUserUpToWeek.get(choice_opponent_sleeper_id, week_to_update).wins;

    //console.log(`choice_wins = ${choice_wins}`);
    //console.log(`opponent_wins = ${opponent_wins}`);

    return choice_wins < opponent_wins;
}

function calculateScore(outcome, isUnderdogPick, isDouble, isTriple, isAuto) {
    let scoreCalc = 0;

    if (outcome == "WIN") {
        // Auto picks receive no bonuses for underdog scoring
        if (isAuto) return SCORE_WIN;

        if (isUnderdogPick) {
            scoreCalc = SCORE_UNDERDOG_WIN;
        } else {
            scoreCalc = SCORE_WIN;
        }
        scoreCalc = calculateBonuses(scoreCalc, isDouble, isTriple);
    } else if (outcome == "LOSS") {
        if (isDouble) {
            scoreCalc = SCORE_DOUBLE_DOWN_LOSS;
        } else if (isTriple) {
            scoreCalc = SCORE_TRIPLE_DOWN_LOSS;
        }
    }

    return scoreCalc;
}

function calculateBonuses(score, isDouble, isTriple) {
    if (isDouble) {
        return +score * 2;
    } else if (isTriple) {
        return +score * 3;
    } else {
        return +score;
    }
}

function printSectionLogMessage(msg) {
    logger.info("");
    logger.info(`==================== ${msg} ====================`);
    logger.info("");
}