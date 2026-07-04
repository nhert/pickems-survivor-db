import { getAllSurvivorPoolEntriesForWeek, getGameStates, updateSurvivorPoolEntryOutcome, updateGameStatesProcessedWeek, updateGameStatesSurvivorFinished, createSurvivorPoolEntry, createMissedSurvivorPoolEntry } from '../data/queries.js';
import { getSleeperMatchupsForWeek } from '../sleeper/sleeper-api.js';

// params: boolean, number
export async function runUpdate(forceSurvivorProcessing, week) {
    // Need to get the last week we ran the update for. Stored in game_states
    const game_states = getGameStates.get();
    if (!game_states) {
        console.error("Could not find game_states");
        return;
    }

    // If running manually with a specific week, run the update for that week. 
    // Otherwise if week is null, get the last processed week from DB and do + 1 to process the latest week.
    const week_to_update = week ?? game_states.last_processed_week + 1;
    console.log(`Running update-db-score.js for week [${week_to_update}] at ${new Date()}`);
    if (week_to_update > 14) {
        console.warn("Skipping update-db-score.js since week is out of range (>14)");
        return;
    }
    console.log(game_states);

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
    const matchups = await getSleeperMatchupsForWeek(week_to_update);
    if (!matchups) {
        console.error("Could not find sleeper matchups!");
        return;
    }
    console.log(matchups);

    // Logic to update survivor pool entries.
    // Need to get all the Survivor Pool entries for the current week 
    if (forceSurvivorProcessing || game_states.survivor_pool_outcome == "UNKNOWN") {
        let succeeded = processSurvivorPool(matchups, game_states, week_to_update);
        if (!succeeded) {
            console.error(`Survivor pool processing FAILED for week [${week_to_update}]`);
        }
    }

    // use the array from above to determine outcome for each pickems entry
    // ...

    // Update game_states last processed week 
    console.log(`Setting last processed week to [${week_to_update}]`);
    updateGameStatesProcessedWeek.run(week_to_update, new Date().toISOString());
}

function processSurvivorPool(matchups, game_states, week_to_update) {
    const survivorEntriesForWeek = getAllSurvivorPoolEntriesForWeek.all(week_to_update);
    if (survivorEntriesForWeek) {
        console.log(survivorEntriesForWeek);

        // use the matchups array from above to determine outcome for each survivor entry
        let successfulUpdateCount = 0;
        for (var entry of survivorEntriesForWeek) {
            if (entry.outcome == "MISSED") {
                // note: missed entries will never have their result changed by stat corrections or otherwise. If user somehow has a mistaken MISSED entry, will have to be fixed manually in the DB.
                console.warn(`Skipping outcome resolution for ${entry.owner} for week ${week_to_update} since it is outcome MISSED`);
                continue;
            }
            var matchupResult = matchups.find(obj => obj.sleeperId == entry.choice_sleeper_id);
            console.log(`Setting outcome for ${entry.owner} for week ${week_to_update} to [${matchupResult.outcome}]`);
            entry.outcome = matchupResult.outcome;
            const updateResult = updateSurvivorPoolEntryOutcome.run(matchupResult.outcome, entry.owner, week_to_update);
            successfulUpdateCount += updateResult.changes;
        }

        const countOfNonMissedEntries = survivorEntriesForWeek.filter(entry => entry.outcome != "MISSED").length;
        console.log(`[${successfulUpdateCount}] rows successfully updated for entry count of [${countOfNonMissedEntries}]`);
        if (countOfNonMissedEntries != successfulUpdateCount) {
            console.error("Mismatch between number of successful row updates and number of entries to update - script needs to be run again");
            return false;
        }

        checkForMissedEntries(survivorEntriesForWeek, week_to_update, game_states);
        determineSurvivorPoolGameEndState(survivorEntriesForWeek, week_to_update, game_states);
        return true;
    } else {
        console.error(`Could not find any survivor entries for week ${week_to_update}`);
        return false;
    }
}

// After week 1, if a player has winning entries, but then misses a weeks submission, need to mark them as eliminated by inserting a MISSED survivor pool entry for them.
// If a user misses the week 1 submission, they will be appropriately blocked in the UI from making any future submissions already.
function checkForMissedEntries(survivorEntriesForWeek, week_to_update, game_states) {
    if (week_to_update == 1) {
        console.warn(`Skipping checkForMissedEntries processing since it is week 1`);
        return;
    }
    console.log(`Running checkForMissedEntries for week [${week_to_update}]`);

    // step 1 get list of emails who were not eliminated last week (they should be making an entry this week)
    const lastWeek = (+week_to_update) - 1;
    const survivorEntriesForLastWeek = getAllSurvivorPoolEntriesForWeek.all(lastWeek);
    if (!survivorEntriesForLastWeek) {
        console.error(`Skipping checkForMissedEntries processing since last weeks entries could not be found`);
        return;
    }
    const winnersLastWeekEmailsArray = survivorEntriesForLastWeek.filter(obj => obj.outcome == "WIN" || obj.outcome == "TIE").map(entry => entry.owner);

    // step 2 match the list of people who are still alive to the list of people who made submissions this week and get a list of missing emails.
    const submissionsThisWeekEmailsArray = survivorEntriesForWeek.map(entry => entry.owner);
    const missingEmails = winnersLastWeekEmailsArray.filter(item => !submissionsThisWeekEmailsArray.includes(item));

    if (missingEmails.length > 0) {
        console.log(`Found players with missing submissions this week ${missingEmails}`);
        console.log(missingEmails);
    }

    for (var email of missingEmails) {
        console.log(`Setting outcome for ${email} for week ${week_to_update} to [MISSED]! Shame!`);
        createMissedSurvivorPoolEntry.run(email, week_to_update, new Date().toISOString());
    }
}

function determineSurvivorPoolGameEndState(entries, week, game_states) {
    const unknownEntries = entries.filter(obj => obj.outcome === "UNKNOWN");
    const winningEntries = entries.filter(obj => obj.outcome === "WIN" || obj.outcome === "TIE");
    const losingEntries = entries.filter(obj => obj.outcome === "LOSS");
    const numWinners = winningEntries.length;

    if (unknownEntries.length > 0) {
        console.error("Trying to run determineSurvivorPoolGameEndState on entries that have UNKNOWN outcome.");
        return;
    }

    console.log(`There were [${numWinners}] winners in survivor pool this week`);

    const winners = getListOfPlayerEmailsFromEntries(winningEntries);
    const losers = getListOfPlayerEmailsFromEntries(losingEntries);

    if (numWinners == 1) { // game over, someone won
        updateGameStatesSurvivorFinished.run("WON", winners, week, new Date().toISOString());
        console.log(`Survivor Pool has been won by one person! Congratulations, ${winners}`);
    } else if (numWinners == 0) { // game over, it was a tie between multiple people who got eliminated at once
        updateGameStatesSurvivorFinished.run("TIE", losers, week, new Date().toISOString());
        console.log(`Survivor Pool has been tied by ${losingEntries.length} people! Congratulations, ${losers}`);
    } else if (week == 14) { // Reached end of season, and more than 1 person won week 14. Winners all tie.
        updateGameStatesSurvivorFinished.run("TIE", winners, week, new Date().toISOString());
        console.log(`Survivor Pool has reached end of week 14 with multiple winners! Congratulations, ${winners}`);
    } else { // otherwise, the game continues
        if (game_states.survivor_pool_outcome != "UNKNOWN") {
            // In the case where something goes wrong and breaks game state, need to allow it to reset back to UNKNOWN on manual run.
            updateGameStatesSurvivorFinished.run("UNKNOWN", null, null, new Date().toISOString());
            console.log("Survivor Pool game state has been reset to UNKNOWN");
        } else {
            console.log(`Game outcome of Survivor Pool is still UNKNOWN`);
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