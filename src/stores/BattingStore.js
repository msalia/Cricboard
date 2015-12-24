/*
 * Batting Store
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var RosterStore = require('RosterStore');
var BaseStore = require('BaseStore');
var SettingsStore = require('SettingsStore');
var BowlingStore = require('BowlingStore');

var {
    ActionTypes,
    TeamTypes,
    ScoreTypes,
} = AppConstants;

class BattingStore extends BaseStore {

    constructor() {
        super();
        this.reset();

        this.setupActions();
    }

    reset() {
        this.initialized = false;
        this.playChanged = false;
        this.battingTeam = null;
        this.battingTeamRoster = [];
        this.fullTeam = [];

        this.loadPlayers();
        this.resetScore();
        this.emitChange();
    }

    resetScore() {
        this.strikeBatsman = null;
        this.runningBatsman = null;

        this.runs = 0;
        this.wickets = 0;
        this.batsman = [];

        this.shouldProceed = false;

        this.changeBatsman1 = true;
        this.changeBatsman2 = true;
        this.emitChange();
    }

    setupActions() {
        this.addAction(ActionTypes.LOAD_SCORE_BOARD, this.loadScoreboard);
        this.addAction(ActionTypes.CHOOSE_BATSMAN, this.chooseBatsman);
        this.addAction(ActionTypes.SCORE_EXTRA, this.scoreExtra);
        this.addAction(ActionTypes.SCORE_RUNS, this.scoreRuns);
        this.addAction(ActionTypes.PLAY_CHANGE, this.playChange);
        this.addAction(ActionTypes.SWAP_BATSMAN, this.swapBatsman);
        this.addAction(ActionTypes.RESET, this.resetScore);
    }

    loadScoreboard(action) {
        if (this.initialized) {
            return;
        }

        this.getDispatcher().waitFor([ 
            RosterStore.getDispatchToken(),
        ]);

        var rosters = RosterStore.getRosters();
        if (rosters.tossWonBy === TeamTypes.HOME) {
            this.battingTeam = rosters.choseToBat ? TeamTypes.HOME : TeamTypes.AWAY;
        } else {
            this.battingTeam = rosters.choseToBat ? TeamTypes.AWAY : TeamTypes.HOME;
        }

        this.loadPlayers(this.battingTeam);
        this.initialized = true;
        this.emitChange();
    }

    loadPlayers(team) {
        var rosters = RosterStore.getRosters();
        var homeTeam = rosters.homeTeamRoster || {};
        var awayTeam = rosters.awayTeamRoster || {};

        this.battingTeamRoster = team === TeamTypes.HOME ? homeTeam.players : awayTeam.players;
        this.battingTeamRoster = this.battingTeamRoster || [];
        this.emitChange();
    }

    playChange(action) {
        if (!this.initialized) {
            return;
        }

        this.playChanged = true;
        this.battingTeam = this.battingTeam === TeamTypes.HOME ? TeamTypes.AWAY : TeamTypes.HOME;
        this.loadPlayers(this.battingTeam);
        this.resetScore();
        this.emitChange();
    }

    chooseBatsman(action) {
        if (!this.initialized) {
            return;
        }

        var position = action.position;
        var id = action.id;
        var batsman = this.battingTeamRoster || [];
        var found = batsman.findIndex(player => player.id === id);
        var alreadyBatted = this.batsman.findIndex(player => player.id === id);

        if (found >= 0 && alreadyBatted < 0) {
            if (position === 1) {
                this.strikeBatsman = batsman[found];
                this.strikeBatsman.runs = 0;
                this.strikeBatsman.balls = 0;
                this.batsman.push(this.strikeBatsman);
            } else {
                this.runningBatsman = batsman[found];
                this.runningBatsman.runs = 0;
                this.runningBatsman.balls = 0;
                this.batsman.push(this.runningBatsman);
            }
            this.shouldProceed = this.strikeBatsman != null && this.runningBatsman != null;
        }
        this.emitChange();
    }

    scoreExtra(action) {
        if (!this.initialized || !this.strikeBatsman || !this.runningBatsman) {
            return;
        }

        this.getDispatcher().waitFor([ 
            SettingsStore.getDispatchToken(),
        ]);

        var settings = SettingsStore.getData();
        switch(action.scoreType) {
            case ScoreTypes.WIDE:
            case ScoreTypes.NO_BALL:
                this.runs++;
                break;
            case ScoreTypes.WICKET:
                this.runs -= settings.isPlayoffs ? settings.playoffWicketRuns : settings.seasonWicketRuns;
                this.wickets++;
                this.strikeBatsman.balls += 1;
                this.strikeBatsman = null;
                this.shouldProceed = false;
                break;
        }

        this.checkGameState();
        this.emitChange();
    }

    checkGameState() {
        if (this.battingWinCondition()) {
            if (!this.playChanged) {
                setTimeout(() => AppActions.playChange(), 0);
            } else {
                setTimeout(() => AppActions.gameOver(), 0);
            }
        }
    }

    battingWinCondition() {
        this.getDispatcher().waitFor([ 
            SettingsStore.getDispatchToken(),
        ]);
        return (this.wickets >= SettingsStore.getData().maxWickets);
    }

    scoreRuns(action) {
        if (!this.initialized || !this.strikeBatsman || !this.runningBatsman) {
            return;
        }

        this.runs += action.runs;
        if (action.ballIncre) {
            this.strikeBatsman.runs += action.runs;
            this.strikeBatsman.balls += 1;
        }
        this.emitChange();
    }

    swapBatsman(action) {
        var strike = this.strikeBatsman;
        this.strikeBatsman = this.runningBatsman;
        this.runningBatsman = strike;
        this.emitChange();
    }

    getData() {
        return {
            battingTeam: this.battingTeam,
            battingTeamRoster: this.battingTeamRoster,
            batsman1: this.strikeBatsman || null,
            batsman2: this.runningBatsman || null,
            batsman: this.batsman,
            changeBatsman1: this.changeBatsman1,
            changeBatsman2: this.changeBatsman2,
        };
    }

    getRuns() {
        return this.runs;
    }

    getWickets() {
        return this.wickets;
    }

    getBattedBatsman() {
        return this.batsman;
    }

    getRemainingBatsman() {
        return this.battingTeamRoster;
    }

    proceed() {
        return this.shouldProceed;
    }

}

module.exports = new BattingStore();
