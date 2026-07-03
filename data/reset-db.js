import { resetDb_statements } from "./queries.js";

export async function resetDatabaseToDefault() {
    console.log("Resetting Survivor Pickems DB");
    runResetStatements();
}

function runResetStatements() {
    for (const stmt of resetDb_statements) {
        stmt.run();
    }
}