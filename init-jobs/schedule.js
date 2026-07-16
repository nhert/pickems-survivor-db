import { addSchedule, clearSchedule } from '../data/queries.js';
import schedule from '../_constants/schedule-latest-UPDATEME.json' with { type: 'json' };

function clearData() {
    clearSchedule.run();
    console.log("\t- Cleared any existing data from nfl_schedule table");
}

function loadData() {
    console.log("\t- Loading data from schedule-latest-UPDATEME.json and inserting into the nfl_schedule table");
    let count = 0;
    schedule.latest.forEach(element => {
        count++;
        //console.log("creating schedule: week " + element.week + " cuts off at " + element.cutoff_datetime);
        addSchedule.run(element.week, element.start_datetime, element.cutoff_datetime);
    });
    console.log("Added [" + count + "] entries to the nfl_schedule table");
}

export function refreshSchedule() {
    console.log("Refreshing data in the nfl_schedule table");
    if (!schedule || !schedule.latest) {
        console.error("Could not find schedule-latest-UPDATEME.json");
    } else {
        clearData();
        loadData();
    }
}