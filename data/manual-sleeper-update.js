import { runUpdate } from "../cron-jobs/update-db-score.js";

let week;
let forceSurvivorProcessing;

var args = process.argv.slice(2);
if (args.length == 2) {
    console.log(`Manual Update called with args [${args[0]}] [${args[1]}]\n`);
    forceSurvivorProcessing = args[0] === "true";
    week = args[1];
    runUpdate(true, forceSurvivorProcessing, week);
} else {
    console.error("missing parameters for manual score update call. usage: npm run manual [forceSurvivorProcessing=true/false] [week=1, 2, 3, ..., 14]");
}