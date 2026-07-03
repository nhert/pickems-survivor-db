import { runUpdate } from "../cron-jobs/update-db-score.js";

let week;
var args = process.argv.slice(2);
if (args.length > 0) {
    week = args[0];
}

runUpdate(true, week);