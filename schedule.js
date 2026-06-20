import { addSchedule, clearSchedule } from './data/queries.js';
import schedule from './schedule-latest-UPDATEME.json' with { type: 'json' };

function clearData() {
    clearSchedule.run();
    console.log("Cleared any existing data from nfl_schedule table");
}

function loadData() {
    console.log("Loading data from schedule-latest-UPDATEME.json and inserting into the nfl_schedule table");
    schedule.latest.forEach(element => {
        console.log("creating schedule: week " + element.week + " cuts off at " + element.cutoff_datetime);
        addSchedule.run(element.week, element.cutoff_datetime);
    });
}

if (!schedule || !schedule.latest) {
    console.error("could not find schedule-latest-UPDATEME.json");
} else {
    clearData();
    loadData();
}