// Populates the db with some test data.

import { createUser, createSurvivorPoolEntry } from '../data/queries.js';

const A_LEAGUE_NAME = "A League";
const B_LEAGUE_NAME = "B League";

const USERS = [
    {
        name: "Jer",
        sleeperId_current: "471702444481441792",
        sleeperIds_old: [],
        legacyId: "userId-90093",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Nate",
        sleeperId_current: "867462835893080064",
        sleeperIds_old: [],
        legacyId: "userId-27062481",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Caolan",
        sleeperId_current: "867562511770255360",
        sleeperIds_old: [],
        legacyId: "userId-95527",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Dalley",
        sleeperId_current: "867601213447897088",
        sleeperIds_old: [],
        legacyId: "userId-91161",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Rimon",
        sleeperId_current: "869618771407556608",
        sleeperIds_old: [],
        legacyId: "userId-91908",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Omar",
        sleeperId_current: "441653692567908352",
        sleeperIds_old: [],
        legacyId: "userId-5318397",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Ricky",
        sleeperId_current: "471826036959473664",
        sleeperIds_old: [],
        legacyId: "userId-27845667",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Alex",
        sleeperId_current: "731243643578490880",
        sleeperIds_old: [],
        legacyId: "userId-19416897",
        currentLeague: "On Hiatus"
    },
    {
        name: "Picco",
        sleeperId_current: "865480383385448448",
        sleeperIds_old: [],
        legacyId: "userId-28536059",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Jordan S.",
        sleeperId_current: "865596427626201088",
        sleeperIds_old: [],
        legacyId: "userId-130280",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Eric",
        sleeperId_current: "866400340310917120",
        sleeperIds_old: [],
        legacyId: "userId-144377",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Tom",
        sleeperId_current: "867272838229454848",
        sleeperIds_old: [],
        legacyId: "userId-14712314",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Ryan",
        sleeperId_current: "1129286835634581504",
        sleeperIds_old: ["867294931482505216"],
        legacyId: "userId-25196559",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Jordan I.",
        sleeperId_current: "867433255367008256",
        sleeperIds_old: [],
        legacyId: "userId-13060178",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Liam",
        sleeperId_current: "867479730138583040",
        sleeperIds_old: [],
        legacyId: "userId-25169661",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Mike",
        sleeperId_current: "867489506998267904",
        sleeperIds_old: [],
        legacyId: "userId-7530198",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Zack",
        sleeperId_current: "867531909708840960",
        sleeperIds_old: [],
        legacyId: "userId-5280198",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Scott",
        sleeperId_current: "867587986001403904",
        sleeperIds_old: [],
        legacyId: "userId-5339416",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Jake",
        sleeperId_current: "867593986880229376",
        sleeperIds_old: [],
        legacyId: "userId-90171",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Tikl",
        sleeperId_current: "867598805816795136",
        sleeperIds_old: [],
        legacyId: "userId-7830798",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Marty",
        sleeperId_current: "998276027312889856",
        sleeperIds_old: ["867970353417363456"],
        legacyId: "userId-962198",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Ty",
        sleeperId_current: "867598396356259840",
        sleeperIds_old: [],
        legacyId: "userId-14721116",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Papa T",
        sleeperId_current: "868693802389540864",
        sleeperIds_old: [],
        legacyId: "userId-90093",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Dan",
        sleeperId_current: "868705613276925952",
        sleeperIds_old: [],
        legacyId: "userId-7401235",
        currentLeague: B_LEAGUE_NAME
    },
    {
        name: "Jackson",
        sleeperId_current: "1130918451767369728",
        sleeperIds_old: [],
        legacyId: "-",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Big Red",
        sleeperId_current: "1130914622246318080",
        sleeperIds_old: [],
        legacyId: "-",
        currentLeague: A_LEAGUE_NAME
    },
    {
        name: "Cole",
        sleeperId_current: "868742012944420864",
        sleeperIds_old: [],
        legacyId: "-",
        currentLeague: B_LEAGUE_NAME
    }
]

const sampleUsers = [
    { email: 'testuser1@b3fl.com', username: 'bot1' },
    { email: 'testuser2@b3fl.com', username: 'bot2' },
    { email: 'testuser3@b3fl.com', username: 'bot3' },
    { email: 'testuser4@b3fl.com', username: 'bot4' },
    { email: 'testuser5@b3fl.com', username: 'bot5' },
    { email: 'testuser6@b3fl.com', username: 'bot6' },
    { email: 'testuser7@b3fl.com', username: 'bot7' },
    { email: 'testuser8@b3fl.com', username: 'bot8' },
    { email: 'testuser9@b3fl.com', username: 'bot9' },
    { email: 'dummy.user.test@com.com', username: 'dummy' },
    { email: 'dummy.user.test2@com.com', username: 'dummy2' },
]

export function genSamples() {
    // Create sample users
    sampleUsers.forEach(element => {
        console.log("creating user: " + element.email);
        createUser.run(element.email, element.username);
    });

    // Create sample survivor pool entries

    //owner, week, choice_sleeper_id, choice_gm_name, updated_at
    createSurvivorPoolEntry.run('dummy.user.test@com.com', 1, '998276027312889856', USERS.find(user => user.sleeperId_current == '998276027312889856').name, new Date().toISOString());
    createSurvivorPoolEntry.run('dummy.user.test@com.com', 2, '1130914622246318080', USERS.find(user => user.sleeperId_current == '1130914622246318080').name, new Date().toISOString());
    createSurvivorPoolEntry.run('dummy.user.test@com.com', 3, '866400340310917120', USERS.find(user => user.sleeperId_current == '866400340310917120').name, new Date().toISOString());
    createSurvivorPoolEntry.run('dummy.user.test@com.com', 4, '867272838229454848', USERS.find(user => user.sleeperId_current == '867272838229454848').name, new Date().toISOString());
    createSurvivorPoolEntry.run('dummy.user.test@com.com', 5, '471702444481441792', USERS.find(user => user.sleeperId_current == '471702444481441792').name, new Date().toISOString());
    createSurvivorPoolEntry.run('dummy.user.test@com.com', 6, '867479730138583040', USERS.find(user => user.sleeperId_current == '867479730138583040').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 7, '867598805816795136', USERS.find(user => user.sleeperId_current == '867598805816795136').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 8, '471826036959473664', USERS.find(user => user.sleeperId_current == '471826036959473664').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 9, '867562511770255360', USERS.find(user => user.sleeperId_current == '867562511770255360').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 10, '866400340310917120', USERS.find(user => user.sleeperId_current == '866400340310917120').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 11, '868705613276925952', USERS.find(user => user.sleeperId_current == '868705613276925952').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 12, '867587986001403904', USERS.find(user => user.sleeperId_current == '867587986001403904').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 13, '867489506998267904', USERS.find(user => user.sleeperId_current == '867489506998267904').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test@com.com', 14, '867601213447897088', USERS.find(user => user.sleeperId_current == '867601213447897088').name, new Date().toISOString());

    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 1, '998276027312889856', USERS.find(user => user.sleeperId_current == '998276027312889856').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 2, '1130914622246318080', USERS.find(user => user.sleeperId_current == '1130914622246318080').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 3, '866400340310917120', USERS.find(user => user.sleeperId_current == '866400340310917120').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 4, '867272838229454848', USERS.find(user => user.sleeperId_current == '867272838229454848').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 5, '471702444481441792', USERS.find(user => user.sleeperId_current == '471702444481441792').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 6, '866400340310917120', USERS.find(user => user.sleeperId_current == '866400340310917120').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 7, '867598805816795136', USERS.find(user => user.sleeperId_current == '867598805816795136').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 8, '471826036959473664', USERS.find(user => user.sleeperId_current == '471826036959473664').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 9, '867562511770255360', USERS.find(user => user.sleeperId_current == '867562511770255360').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 10, '866400340310917120', USERS.find(user => user.sleeperId_current == '866400340310917120').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 11, '868705613276925952', USERS.find(user => user.sleeperId_current == '868705613276925952').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 12, '867587986001403904', USERS.find(user => user.sleeperId_current == '867587986001403904').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 13, '867489506998267904', USERS.find(user => user.sleeperId_current == '867489506998267904').name, new Date().toISOString());
    // createSurvivorPoolEntry.run('dummy.user.test2@com.com', 14, '867601213447897088', USERS.find(user => user.sleeperId_current == '867601213447897088').name, new Date().toISOString());

    // MISSED ENTRY TEST
    createSurvivorPoolEntry.run('testuser3@b3fl.com', 1, '998276027312889856', USERS.find(user => user.sleeperId_current == '998276027312889856').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser3@b3fl.com', 2, '1130914622246318080', USERS.find(user => user.sleeperId_current == '1130914622246318080').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser3@b3fl.com', 3, '867562511770255360', USERS.find(user => user.sleeperId_current == '867562511770255360').name, new Date().toISOString());

    // week 1 fail
    createSurvivorPoolEntry.run('testuser4@b3fl.com', 1, '867593986880229376', USERS.find(user => user.sleeperId_current == '867593986880229376').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser5@b3fl.com', 1, '1130914622246318080', USERS.find(user => user.sleeperId_current == '1130914622246318080').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser6@b3fl.com', 1, '441653692567908352', USERS.find(user => user.sleeperId_current == '441653692567908352').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser7@b3fl.com', 1, '867462835893080064', USERS.find(user => user.sleeperId_current == '867462835893080064').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser8@b3fl.com', 1, '867598805816795136', USERS.find(user => user.sleeperId_current == '867598805816795136').name, new Date().toISOString());


    // MAKE MORE ENTRIES FOR TESTING

    createSurvivorPoolEntry.run('testuser1@b3fl.com', 1, '998276027312889856', USERS.find(user => user.sleeperId_current == '998276027312889856').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser1@b3fl.com', 2, '867598805816795136', USERS.find(user => user.sleeperId_current == '867598805816795136').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser1@b3fl.com', 3, '867601213447897088', USERS.find(user => user.sleeperId_current == '867601213447897088').name, new Date().toISOString());

    createSurvivorPoolEntry.run('testuser2@b3fl.com', 1, '998276027312889856', USERS.find(user => user.sleeperId_current == '998276027312889856').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser2@b3fl.com', 2, '868705613276925952', USERS.find(user => user.sleeperId_current == '868705613276925952').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser2@b3fl.com', 3, '441653692567908352', USERS.find(user => user.sleeperId_current == '441653692567908352').name, new Date().toISOString());
    createSurvivorPoolEntry.run('testuser2@b3fl.com', 4, '867593986880229376', USERS.find(user => user.sleeperId_current == '867593986880229376').name, new Date().toISOString());


    // etc
}