/*
 * Batting Store
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var RosterStore = require('RosterStore');
var BaseStore = require('BaseStore');
var BowlingStore = require('BowlingStore');
var SettingsStore = require('SettingsStore');
var SweetAlert = require('sweetalert');

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
        this.battingTeam = null;
        this.battingTeamRoster = [];
        this.fullTeam = [];

        this.isExtra = false;
        this.isWicket = false;

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
        this.addAction(ActionTypes.SCORE_BALLS, this.scoreBalls);
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

        if (found >= 0) {
            var batter = batsman[found];
            if (alreadyBatted >= 0) {
                SweetAlert({   
                    title: "Are you sure?",  
                    text: `${batter.first} ${batter.last} has already batted.`,   
                    type: "error",
                    confirmButtonText: "I know what I'm doing!",   
                    closeOnConfirm: true, 
                });
            }

            if (position === 1) {
                this.strikeBatsman = batter;
                if (this.strikeBatsman.runs == null) {
                    this.strikeBatsman.runs = 0;
                }
                if (this.strikeBatsman.balls == null) {
                    this.strikeBatsman.balls = 0;
                }
                if (this.strikeBatsman.sixes == null) {
                    this.strikeBatsman.sixes = 0;
                }
                if (this.strikeBatsman.fours == null) {
                    this.strikeBatsman.fours = 0;
                }
                if (this.strikeBatsman.foursAllowed == null) {
                    this.strikeBatsman.foursAllowed = 0;
                }
                if (this.strikeBatsman.sixesAllowed == null) {
                    this.strikeBatsman.sixesAllowed = 0;
                }
                (alreadyBatted < 0) && this.batsman.push(this.strikeBatsman);
            } else {
                this.runningBatsman = batter;
                if (this.runningBatsman.runs == null) {
                    this.runningBatsman.runs = 0;
                }
                if (this.runningBatsman.balls == null) {
                    this.runningBatsman.balls = 0;
                }
                if (this.runningBatsman.sixes == null) {
                    this.runningBatsman.sixes = 0;
                }
                if (this.runningBatsman.fours == null) {
                    this.runningBatsman.fours = 0;
                }
                if (this.runningBatsman.foursAllowed == null) {
                    this.runningBatsman.foursAllowed = 0;
                }
                if (this.runningBatsman.sixesAllowed == null) {
                    this.runningBatsman.sixesAllowed = 0;
                }
                (alreadyBatted < 0) && this.batsman.push(this.runningBatsman);
            }
            this.shouldProceed = this.strikeBatsman != null && this.runningBatsman != null;
        }
        this.emitChange();
    }

    scoreExtra(action) {
        if (!this.initialized || !this.strikeBatsman || !this.runningBatsman) {
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

    scoreRuns(action) {
        if (!this.initialized || !this.strikeBatsman || !this.runningBatsman) {
            return;
        }

        if (action.runs === 4) {
            this.strikeBatsman.fours += 1;
        } else if (action.runs === 6) {
            this.strikeBatsman.sixes += 1;
        }

        this.runs += action.runs;
        if (this.isExtra) {
            this.runs += 1;
            this.strikeBatsman.runs += action.runs;
            this.isExtra = false;
        } else if (this.isWicket) {
            this.getDispatcher().waitFor([ 
                SettingsStore.getDispatchToken(),
            ]);

            var settings = SettingsStore.getData();
            this.runs -= settings.isPlayoffs ? settings.playoffWicketRuns : settings.seasonWicketRuns;
            this.wickets++;
            this.strikeBatsman.balls += 1;
            this.strikeBatsman.runs += action.runs;
            this.strikeBatsman = null;
            this.shouldProceed = false;
            this.isWicket = false;
        } else {
            this.strikeBatsman.runs += action.runs;
            if (action.ballIncre) {
                this.strikeBatsman.balls += 1;
            }
        }
        this.emitChange();
    }

    scoreBalls(action) {
        if (action.balls === 1) {
            this.strikeBatsman.balls += 1;
        } else {
            this.strikeBatsman.balls -= 1;
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
