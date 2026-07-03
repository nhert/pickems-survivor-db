import { runUpdate } from "../cron-jobs/update-db-score.js";

// Run the wednesday update
// If params left empty, will run for the current nfl week (defined in db as last week+1)
// If specified, will run for week param
runUpdate();