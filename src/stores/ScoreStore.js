/*
 * Score Store
 * @flow
 */

var AppConstants = require('AppConstants');
var RosterStore = require('RosterStore');
var BaseStore = require('BaseStore');

var {
    ActionTypes,
    TeamTypes,
} = AppConstants;

class ScoreStore extends BaseStore {

    constructor() {
        super();
        this.reset();

        this.setupActions();
    }

    reset() {
        this.homeTeam = { runs: 0, overs: 0, wickets: 0 };
        this.awayTeam = { runs: 0, overs: 0, wickets: 0 };
        this.battingTeam = null;
        this.bowlingTeam = null;
        this.currentBowler = null;
        this.strikeBatsman = null;
        this.runningBatsman = null;

        this.bowlers = [];
        this.batsman = [];
        this.overs = [];
        this.currentOver = {};
        this.runs = 0;
        this.wickets = 0;
        this.balls = 0;
    }

    setupActions() {
        this.addAction(ActionTypes.INIT_LOAD, this.initLoad);
        this.addAction(ActionTypes.LOAD_SCORE_BOARD, this.loadScoreboard);
    }

    initLoad(action) {
        this.emitChange();
    }

    loadScoreboard(action) {
        this.getDispatcher().waitFor([ RosterStore.getDispatchToken() ]);
        var rosters = RosterStore.getRosters();
        if (rosters.tossWonBy === TeamTypes.HOME) {
            this.battingTeam = rosters.choseToBat ? TeamTypes.HOME : TeamTypes.AWAY;
            this.bowlingTeam = rosters.choseToBat ? TeamTypes.AWAY : TeamTypes.HOME;
        } else {
            this.battingTeam = rosters.choseToBat ? TeamTypes.AWAY : TeamTypes.HOME;
            this.bowlingTeam = rosters.choseToBat ? TeamTypes.HOME : TeamTypes.AWAY;
        }
        this.emitChange();
    }

    getData() {
        return {
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            battingTeam: this.battingTeam,
            bowlingTeam: this.bowlingTeam,
            bowler: this.currentBowler ? this.bowlers[this.currentBowler] : {},
            batsman1: this.strikeBatsman ? this.batsman[this.strikeBatsman] : {},
            batsman2: this.runningBatsman ? this.batsman[this.runningBatsman] : {},
            bowlers: this.bowlers,
            batsman: this.batsman,
            currentOver: this.currentOver,
        };
    }

}

module.exports = new ScoreStore();
