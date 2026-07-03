import { getAllSurvivorPoolEntriesForWeek, getGameStates, updateSurvivorPoolEntryOutcome, updateGameStatesProcessedWeek, updateGameStatesSurvivorFinished } from '../data/queries.js';
import { getSleeperMatchupsForWeek } from '../sleeper/sleeper-api.js';

export async function runUpdate(week) {
    // Need to get the last week we ran the update for. Stored in game_states
    const game_states = getGameStates.get();
    if (!game_states) {
        console.error("Could not find game_states");
        return;
    }
    const week_to_update = week ?? game_states.last_processed_week + 1;
    console.log(`Running update-db-score.js for week [${week_to_update}] at ${new Date()}`);
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
    const survivorEntriesForWeek = getAllSurvivorPoolEntriesForWeek.all(week_to_update);
    if (survivorEntriesForWeek) {
        console.log(survivorEntriesForWeek);

        // use the matchups array from above to determine outcome for each survivor entry
        let successfulUpdateCount = 0;
        for (var entry of survivorEntriesForWeek) {
            var matchupResult = matchups.find(obj => obj.sleeperId == entry.choice_sleeper_id);
            console.log(`Setting outcome for ${entry.owner} for week ${week_to_update} to [${matchupResult.outcome}]`);
            entry.outcome = matchupResult.outcome;
            const updateResult = updateSurvivorPoolEntryOutcome.run(matchupResult.outcome, entry.owner, week_to_update);
            successfulUpdateCount += updateResult.changes;
        }
        console.log(`[${successfulUpdateCount}] rows successfully updated for entry count of [${survivorEntriesForWeek.length}]`);
        if (survivorEntriesForWeek.length != successfulUpdateCount) {
            console.error("Mismatch between number of successful row updates and number of entries to update - script needs to be run again");
            return;
        }

        determineSurvivorPoolGameEndState(survivorEntriesForWeek, week_to_update, game_states);
    } else {
        console.error(`Could not find any survivor entries for week ${week_to_update}`);
    }

    // use the array from above to determine outcome for each pickems entry

    // Update game_states last processed week 
    updateGameStatesProcessedWeek.run(week_to_update, new Date().toISOString());
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
        updateGameStatesSurvivorFinished.run("WON", winners, new Date().toISOString());
        console.log(`Survivor Pool has been won by one person! Congratulations, ${winners}`);
    } else if (numWinners == 0) { // game over, it was a tie between multiple people who got eliminated at once
        updateGameStatesSurvivorFinished.run("TIE", losers, new Date().toISOString());
        console.log(`Survivor Pool has been tied by ${losingEntries.length} people! Congratulations, ${losers}`);
    } else if (week == 14) { // Reached end of season, and more than 1 person won week 14. Winners all tie.
        updateGameStatesSurvivorFinished.run("TIE", winners, new Date().toISOString());
        console.log(`Survivor Pool has reached end of week 14 with multiple winners! Congratulations, ${winners}`);
    } else { // otherwise, the game continues
        if (game_states.survivor_pool_outcome != "UNKNOWN") {
            // In the case where something goes wrong and breaks game state, need to allow it to reset back to UNKNOWN on manual run.
            updateGameStatesSurvivorFinished.run("UNKNOWN", winners, new Date().toISOString());
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