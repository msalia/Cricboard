/*
 * Score Store
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var RosterStore = require('RosterStore');
var BowlingStore = require('BowlingStore');
var BattingStore = require('BattingStore');
var BaseStore = require('BaseStore');
var SettingsStore = require('SettingsStore');

var {
    ActionTypes,
    TeamTypes,
    ScoreTypes,
} = AppConstants;

class ScoreStore extends BaseStore {

    constructor() {
        super();
        this.reset();

        this.setupActions();
    }

    reset() {
        this.initialized = false;
        this.playChanged = false;
        this.battingTeam = null;
        this.gameOver = false;
        this.resetRuns();
        this.emitChange();
    }

    resetRuns() {
        this.teams = {};
        this.teams[TeamTypes.HOME] = { runs: 0, wickets: 0, balls: 0 };
        this.teams[TeamTypes.AWAY] = { runs: 0, wickets: 0, balls: 0 };
        this.playChanged = false;
        this.emitChange();
    }

    setupActions() {
        this.addAction(ActionTypes.LOAD_SCORE_BOARD, this.loadScoreboard);
        this.addAction(ActionTypes.SCORE_EXTRA, this.score);
        this.addAction(ActionTypes.SCORE_RUNS, this.score);
        this.addAction(ActionTypes.PLAY_CHANGE, this.playChange);
        this.addAction(ActionTypes.RESET, this.resetRuns);
        this.addAction(ActionTypes.GAME_OVER, this.gameDone);
    }

    gameDone() {
        this.gameOver = true;
        this.emitChange();
    }

    loadScoreboard(action) {
        this.getDispatcher().waitFor([ 
            RosterStore.getDispatchToken(),
        ]);

        var rosters = RosterStore.getRosters();
        if (rosters.tossWonBy === TeamTypes.HOME) {
            this.battingTeam = rosters.choseToBat ? TeamTypes.HOME : TeamTypes.AWAY;
        } else {
            this.battingTeam = rosters.choseToBat ? TeamTypes.AWAY : TeamTypes.HOME;
        }

        this.initialized = true;
        this.emitChange();
    }

    score(action) {
        if (!this.initialized) {
            return;
        }

        this.getDispatcher().waitFor([ 
            BowlingStore.getDispatchToken(),
            BattingStore.getDispatchToken(),
        ]);

        this.teams[this.battingTeam].runs = BattingStore.getRuns();
        this.teams[this.battingTeam].balls = BowlingStore.getBalls();
        this.teams[this.battingTeam].wickets = BattingStore.getWickets();
        this.checkGameState();
        this.emitChange();
    }

    checkGameState() {
        this.getDispatcher().waitFor([ 
            SettingsStore.getDispatchToken(),
        ]);

        var bowlingTeam = this.battingTeam === TeamTypes.HOME ? TeamTypes.AWAY : TeamTypes.HOME;
        if (this.runsWinCondition(this.battingTeam, bowlingTeam)) {
            setTimeout(() => AppActions.gameOver(), 0);
        } else if (this.battingWinCondition() || this.ballsWinCondition()) {
            if (!this.playChanged) {
                setTimeout(() => AppActions.playChange(), 0);
            } else {
                setTimeout(() => AppActions.gameOver(), 0);
            }
        }
    }

    ballsWinCondition() {
        return (this.teams[battingTeam].balls >= SettingsStore.getData().overs * 6);
    }

    runsWinCondition(battingTeam, bowlingTeam) {
        return (
            this.playChanged && // Must be in second inning
            this.teams[battingTeam].runs > 0 && // No team can win with 0 runs.
            this.teams[battingTeam].runs > this.teams[bowlingTeam].runs // Batting team gets more runs than the bowling team
        );
    }

    battingWinCondition() {
        return (this.teams[this.battingTeam].wickets >= SettingsStore.getData().maxWickets);
    }

    playChange(action) {
        if (!this.initialized) {
            return;
        }

        this.playChanged = true;
        this.battingTeam = this.battingTeam === TeamTypes.HOME ? TeamTypes.AWAY : TeamTypes.HOME;
        this.emitChange();
    }

    getData() {
        return {
            teams: this.teams,
            gameOver: this.gameOver,
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
        return this.battingTeam;
    }

    getIsPlayChanged() {
        return this.playChanged;
    }

    getIsGameOver() {
        return this.gameOver;
    }

}

module.exports = new ScoreStore();
