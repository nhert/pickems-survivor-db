import { resetDb_statements } from "./queries.js";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function resetDatabaseToDefault(skip_check = false) {
    console.log("skip confirmation input? = " + skip_check);

    if (!skip_check) {
        const rl = readline.createInterface({ input, output });
        const confirmation = await rl.question('Are you certain you want to delete db? ');
        rl.close();

        if (confirmation.toLowerCase() == 'y' || confirmation.toLowerCase() == 'yes') {
            runResetStatements();
        } else {
            console.log("Exiting - DB is safe");
        }
    } else {
        runResetStatements();
    }
}

function runResetStatements() {
    console.log("Resetting Survivor Pickems DB");
    for (const stmt of resetDb_statements) {
        stmt.run();
    }
}