/*
 * Score Store
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var RosterStore = require('RosterStore');
var BaseStore = require('BaseStore');
var SweetAlert = require('sweetalert');
var SettingsStore = require('SettingsStore');

var {
    ActionTypes,
    TeamTypes,
    ScoreTypes,
} = AppConstants;

class BowlingStore extends BaseStore {

    constructor() {
        super();
        this.reset();

        this.setupActions();
    }

    reset() {
        this.initialized = false;
        this.bowlingTeam = null;
        this.bowlingTeamRoster = [];
        this.fullTeam = [];

        this.loadPlayers();
        this.resetBalls();
        this.emitChange();
    }

    resetBalls() {
        this.currentBowler = null;
        this.changeBowler = true;
        this.shouldProceed = false;

        this.bowlers = [];
        this.overs = [];
        this.currentOver = [];
        this.balls = 0;
        this.emitChange();
    }

    setupActions() {
        this.addAction(ActionTypes.LOAD_SCORE_BOARD, this.loadScoreboard);
        this.addAction(ActionTypes.CHOOSE_BOWLER, this.chooseBowler);
        this.addAction(ActionTypes.SCORE_EXTRA, this.scoreExtra);
        this.addAction(ActionTypes.SCORE_RUNS, this.scoreRuns);
        this.addAction(ActionTypes.SCORE_BALLS, this.scoreBalls);
        this.addAction(ActionTypes.PLAY_CHANGE, this.playChange);
        this.addAction(ActionTypes.RESET, this.resetBalls);
    }

    playChange(action) {
        if (!this.initialized) {
            return;
        }

        this.bowlingTeam = this.bowlingTeam === TeamTypes.HOME ? TeamTypes.AWAY : TeamTypes.HOME;
        this.loadPlayers(this.bowlingTeam);
        this.resetBalls();
        this.emitChange();
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
            this.bowlingTeam = rosters.choseToBat ? TeamTypes.AWAY : TeamTypes.HOME;
        } else {
            this.bowlingTeam = rosters.choseToBat ? TeamTypes.HOME : TeamTypes.AWAY;
        }

        this.loadPlayers(this.bowlingTeam);
        this.initialized = true;
        this.emitChange();
    }

    loadPlayers(team) {
        var rosters = RosterStore.getRosters();
        var homeTeam = rosters.homeTeamRoster || {};
        var awayTeam = rosters.awayTeamRoster || {};

        this.bowlingTeamRoster = team === TeamTypes.HOME ? homeTeam.players : awayTeam.players;
        this.bowlingTeamRoster = this.bowlingTeamRoster || [];
        this.fullTeam = this.bowlingTeamRoster.slice();
    }

    chooseBowler(action) {
        if (!this.initialized) {
            return;
        }

        var playerId = action.id;
        var bowlers = this.bowlingTeamRoster || [];
        var found = bowlers.findIndex(player => player.id === playerId);

        if (found >= 0) {
            var bowler = bowlers[found];
            var maxOvers = SettingsStore.getData().maxOversPerBowler;
            if (bowler.ballsBowled != null &&
                parseInt(bowler.ballsBowled / 6) >= maxOvers) {
                SweetAlert({   
                    title: "Cannot choose bowler!",  
                    text: `${bowler.first} ${bowler.last} has already bowled ${maxOvers} over(s).`,   
                    type: "error",
                    confirmButtonText: "OK",   
                    closeOnConfirm: true, 
                });
                return;
            }

            this.currentBowler = bowler;
            if (!this.currentBowler.ballsBowled) {
                this.currentBowler.ballsBowled = 0;
            }
            if (!this.currentBowler.wickets) {
                this.currentBowler.wickets = 0;
            }

            this.currentOver = [];
            this.changeBowler = false;
            this.shouldProceed = true;

            if (this.bowlers.findIndex(player => player.id === playerId) < 0) {
                this.bowlers.push(this.currentBowler);
            }
        }
        this.emitChange();
    }

    scoreExtra(action) {
        if (!this.initialized || !this.currentBowler) {
            return;
        }

        switch(action.scoreType) {
            case ScoreTypes.WIDE:
                this.currentOver.push('Wd');
                this.incrementCurrentBowlerRuns(1);
                break;
            case ScoreTypes.NO_BALL:
                this.currentOver.push('Nb');
                this.incrementCurrentBowlerRuns(1);
                break;
            case ScoreTypes.WICKET:
                this.currentOver.push('W');
                this.currentBowler.wickets += 1;
                this.incrementBalls();
                break;
        }
        this.emitChange();
    }

    incrementCurrentBowlerRuns(amount) {
        if (this.currentBowler.runsAllowed) {
            this.currentBowler.runsAllowed += amount;
        } else {
            this.currentBowler.runsAllowed = amount;
        }
    }

    scoreRuns(action) {
        if (!this.initialized || !this.currentBowler) {
            return;
        }

        this.incrementCurrentBowlerRuns(action.runs);

        if (action.ballIncre) {
            this.currentOver.push(action.runs);
            this.incrementBalls();
        }
        this.emitChange();
    }

    scoreBalls(action) {
        if (action.balls === 1) {
            this.incrementBalls(1);
            this.currentOver.push(0);
        } else {
            this.decrementBalls(1);
            this.currentOver.pop();
        }
        this.emitChange();
    }

    decrementBalls(amount) {
        var balls = 1;
        if (amount != null) {
            balls = amount;
        }
        if (this.shouldProceed) {
            this.balls -= balls;
            if (this.balls < 0) {
                this.balls = 0;
            }
        }

        if (this.currentBowler.ballsBowled != null && this.currentBowler.ballsBowled >= amount) {
            this.currentBowler.ballsBowled -= amount;
            if (this.currentBowler.ballsBowled < 0) {
                this.currentBowler.ballsBowled = 0;
            }
        }
        this.emitChange();
    }

    incrementBalls(amount) {
        var balls = 1;
        if (amount != null) {
            balls = amount;
        }
        if (this.shouldProceed) {
            this.balls += balls;
        }

        if (!this.currentBowler.ballsBowled) {
            this.currentBowler.ballsBowled = balls;
        } else {
            this.currentBowler.ballsBowled += balls;
        }

        if (this.balls > 0 && this.balls % 6 === 0) {
            this.overs.push(this.currentOver);
            this.changeBowler = true;
            this.currentBowler = null;
            this.shouldProceed = false;
        }
        this.emitChange();
    }

    getData() {
        return {
            balls: this.balls,
            bowlingTeam: this.bowlingTeam,
            bowlingTeamRoster: this.bowlingTeamRoster || [],
            bowlers: this.bowlers || [],
            currentOver: this.currentOver,
            currentBowler: this.currentBowler,
            changeBowler: this.changeBowler,
        };
    }

    getOvers() {
        return this.overs;
    }

    getCurrentOver() {
        return this.overs[this.currentOver];
    }

    getBalls() {
        return this.balls;
    }

    proceed() {
        return this.shouldProceed;
    }

}

module.exports = new BowlingStore();
