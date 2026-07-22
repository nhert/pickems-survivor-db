import leagues from '../_constants/sleeper-leagues-UPDATEME.json' with { type: 'json' };

function getLeagueRestAPI(leagueId) {
    return "https://api.sleeper.app/v1/league/" + leagueId;
}
function getLeagueUserDataRestAPI(leagueId) {
    return "https://api.sleeper.app/v1/league/" + leagueId + "/users";
}
async function getSleeperRosterRecords(leagueId) {
    const leagueRosterData = await fetch(getLeagueRestAPI(leagueId) + "/rosters")
        .then((res) => res.json());

    return leagueRosterData;
}

export async function getSleeperMatchupsForWeek(week) {
    if (!week) {
        console.error("Week must be provided to getSleeperMatchupsForWeek()");
        return null;
    }
    console.log(`Running getSleeperMatchupsForWeek() with week [${week}]`);

    var resultingWinLossMap = [];
    var resultingMatchups = [];
    var dataA = {};
    var dataB = {};
    const a_league_id = leagues.a_league_sleeper_id;
    const b_league_id = leagues.b_league_sleeper_id;

    dataA = await getMatchupResults(a_league_id, week);
    dataB = await getMatchupResults(b_league_id, week);
    resultingWinLossMap = dataA.winLoss.concat(dataB.winLoss);
    resultingMatchups = dataA.matchups.concat(dataB.matchups);

    return {
        winLoss: resultingWinLossMap,
        matchups: resultingMatchups
    }
}

async function getMatchupResults(leagueId, week) {
    var leagueMatchups = [];
    var leagueRosterMap = new Map(); // rosterId -> sleeperUserId
    var resultingWinLossArray = [];

    try {
        const leagueMatchupData = await fetch(getLeagueRestAPI(leagueId) + "/matchups/" + week).then((res) => res.json());
        var numLeagueMatchups = Math.floor(leagueMatchupData.length / 2);

        const leagueRosterData = await getSleeperRosterRecords(leagueId);
        const leagueUserData = await fetch(getLeagueUserDataRestAPI(leagueId)).then((res) => res.json());

        for (var roster of leagueRosterData) {
            var userId = roster.owner_id;
            var userMetadata = leagueUserData.find(obj => obj.user_id == userId).metadata;
            leagueRosterMap.set(roster.roster_id, { userId: userId, teamName: userMetadata.team_name, teamAvatar: userMetadata.avatar });
        }

        for (let matchupId = 1; matchupId <= numLeagueMatchups; matchupId++) {
            //console.log("looking for matchup=" + matchupId);
            var playersInMatchup = [];
            for (var matchupData of leagueMatchupData) {
                if (matchupData.matchup_id == matchupId) {
                    var userRoster = leagueRosterMap.get(matchupData.roster_id);
                    var userId = userRoster.userId;

                    playersInMatchup.push({
                        points: matchupData.points,
                        rosterId: matchupData.roster_id,
                        userId: userId,
                        outcome: "UNKNOWN"
                    });
                }
            }
            leagueMatchups.push(playersInMatchup);
        }

        // process win/loss for every matchup
        for (var matchup of leagueMatchups) {
            /*
            matchup contains an array that appears as:
            [
                { points: 80.46, rosterId: 6, userId: '867479730138583040' },
                { points: 114.96, rosterId: 11, userId: '998276027312889856' }
            ]
            */
            if (matchup[0].points > matchup[1].points) {
                matchup[0].outcome = "WIN";
                matchup[1].outcome = "LOSS";
            } else if (matchup[1].points > matchup[0].points) {
                matchup[1].outcome = "WIN";
                matchup[0].outcome = "LOSS";
            } else if (matchup[0].points == matchup[1].points) {
                matchup[0].outcome = "TIE";
                matchup[1].outcome = "TIE";
            }
        }

        for (var matchup of leagueMatchups) {
            if (matchup.length != 2) {
                console.error(`Somehow, there was a matchup without 2 players in it. Try running script again`);
                return null;
            }
            resultingWinLossArray.push({
                sleeperId: matchup[0].userId,
                sleeperId_opponent: matchup[1].userId,
                outcome: matchup[0].outcome
            });
            resultingWinLossArray.push({
                sleeperId: matchup[1].userId,
                sleeperId_opponent: matchup[0].userId,
                outcome: matchup[1].outcome
            });
        }

        return {
            winLoss: resultingWinLossArray,
            matchups: leagueMatchups
        };
    } catch (error) {
        console.error('Fetch error:', error);
    }

    return null;
}

/*
DATA RETURNED BY SLEEPER FOR MATCHUPS
[
{
    points: 97.56,
    players: [
      '10219', '11631', '12490',
      '12514', '4195',  '5012',
      '6770',  '7569',  '7588',
      '8142',  '8167',  'SF',
      'WAS'
    ],
    roster_id: 6,
    custom_points: null,
    matchup_id: 1,
    starters: [
      '6770',  '7588',
      '10219', '8167',
      '12514', '5012',
      '7569',  '4195',
      'WAS'
    ],
    starters_points: [
      23.36, 12.7, 5.2,
       20.9,  1.5, 0.9,
       12.1, 16.9,   4
    ],
    players_points: {
      '4195': 16.9,
      '5012': 0.9,
      '6770': 23.36,
      '7569': 12.1,
      '7588': 12.7,
      '8142': 8,
      '8167': 20.9,
      '10219': 5.2,
      '11631': 8.7,
      '12490': -1.5,
      '12514': 1.5,
      SF: 0,
      WAS: 4
},
{
 .........
}
]
*/