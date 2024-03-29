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

        this.isExtra = false;
        this.isWicket = false;

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
        this.addAction(ActionTypes.GAME_OVER, this.gameDone);
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

    gameDone(action) {
        if (this.currentBowler && this.currentBowler.id != null) {
            this.overs.push({ bowlerId: this.currentBowler.id, over: [].concat(this.currentOver) });
        }
        this.emitChange();
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
            if (!this.currentBowler.extrasGiven) {
                this.currentBowler.extrasGiven = 0;
            }
            if (!this.currentBowler.wickets) {
                this.currentBowler.wickets = 0;
            }
            if (!this.currentBowler.foursAllowed) {
                this.currentBowler.foursAllowed = 0;
            }
            if (!this.currentBowler.sixesAllowed) {
                this.currentBowler.sixesAllowed = 0;
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
            case ScoreTypes.EXTRA:
                this.isExtra = !this.isExtra;
                if (this.isWicket && this.isExtras) {
                    this.isWicket = false;
                }
                break;
            case ScoreTypes.WICKET:
                this.isWicket = !this.isWicket;
                if (this.isExtra && this.isWicket) {
                    this.isExtra = false;
                }
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

        if (action.runs === 6) {
            this.currentBowler.sixesAllowed += 1;
        } else if (action.runs === 4) {
            this.currentBowler.foursAllowed += 1;
        }

        if (this.isExtra) {
            this.currentOver.push('E:' + action.runs);
            this.incrementCurrentBowlerRuns(action.runs + 1);
            this.currentBowler.extrasGiven += 1;
            this.isExtra = false;
        } else if (this.isWicket) {
            this.getDispatcher().waitFor([ 
                SettingsStore.getDispatchToken(),
            ]);

            var settings = SettingsStore.getData();
            var deduction = settings.isPlayoffs ? settings.playoffWicketRuns : settings.seasonWicketRuns;
            this.incrementCurrentBowlerRuns(action.runs - deduction);
            this.currentOver.push('W:' + action.runs);
            this.currentBowler.wickets++;
            this.incrementBalls();
            this.isWicket = false;
        } else {
            this.incrementCurrentBowlerRuns(action.runs);
            this.currentOver.push(action.runs);
            if (action.ballIncre) {
                this.incrementBalls();
            }
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
            this.overs.push({ bowlerId: this.currentBowler.id, over: [].concat(this.currentOver) });
            this.currentOver = [];
            this.changeBowler = true;
            this.currentBowler = null;
            this.shouldProceed = false;
        }
        this.emitChange();
    }

    getData() {
        return {
            balls: this.balls,
            overs: this.overs,
            bowlingTeam: this.bowlingTeam,
            bowlingTeamRoster: this.bowlingTeamRoster || [],
            bowlers: this.bowlers || [],
            currentOver: this.currentOver,
            currentBowler: this.currentBowler,
            changeBowler: this.changeBowler,
            isExtra: this.isExtra,
            isWicket: this.isWicket,
            extras: this.getExtras(),
        };
    }

    getOvers() {
        return this.overs;
    }

    getExtras() {
        var extras = this.calcExtras(this.currentOver || []);
        this.overs.forEach(over => {
            extras += this.calcExtras(over.over);
        });
        return extras;
    }

    calcExtras(over) {
        var total = 0;
        over.forEach(ball => {
            if (typeof ball === 'string') {
                var type = ball.substr(0,2);
                switch (type) {
                    case 'E:':
                        total += 1;
                        break;
                    default:
                        break;
                }
            }
        });
        return total;
    }

    getBalls() {
        return this.balls;
    }

    proceed() {
        return this.shouldProceed;
    }

}

module.exports = new BowlingStore();
