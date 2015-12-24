/*
 * Settings Store
 * @flow
 */

var AppConstants = require('AppConstants');
var BaseStore = require('BaseStore');

var {
    ActionTypes,
    TeamTypes,
    ScoreTypes,
} = AppConstants;

class SettingsStore extends BaseStore {

    constructor() {
        super();
        this.reset();

        this.setupActions();
    }

    reset() {
        this.initialized = false;
        this.overs = 10;
        this.isPlayoffs = false;
        this.playoffWicketRuns = 5;
        this.seasonWicketRuns = 3;
        this.maxWickets = 6;
        this.maxOversPerBowler = 3;
        this.emitChange();
    }

    setupActions() {
        this.addAction(ActionTypes.LOAD_SCORE_BOARD, this.reset);
        this.addAction(ActionTypes.PLAYOFFS_ON_OFF, this.playOffs);
        this.addAction(ActionTypes.SET_OVERS, this.setOvers);
        this.addAction(ActionTypes.SET_PLAYOFF_WICKET_DEDUCTION, this.setPlayoffWicketDeduction);
        this.addAction(ActionTypes.SET_SEASON_WICKET_DEDUCTION, this.setSeasonWicketDeduction);
        this.addAction(ActionTypes.SET_MAX_WICKETS, this.setMaxWickets);
        this.addAction(ActionTypes.SET_MAX_OVERS_PER_BOWLER, this.setMaxOversPerBowler);
    }

    setOvers(action) {
        this.overs = action.count;
        this.emitChange();
    }

    setPlayoffWicketDeduction(action) {
        this.playoffWicketRuns = action.count;
        this.emitChange();
    }

    setSeasonWicketDeduction(action) {
        this.seasonWicketRuns = action.count;
        this.emitChange();
    }

    setMaxWickets(action) {
        this.maxWickets = action.count;
        this.emitChange();
    }

    setMaxOversPerBowler(action) {
        this.maxOversPerBowler = action.count;
        this.emitChange();
    }

    playOffs(action) {
        this.isPlayoffs = action.value;
        this.emitChange();
    }

    getData() {
        return {
            overs: this.overs,
            isPlayoffs: this.isPlayoffs,
            playoffWicketRuns: this.playoffWicketRuns,
            seasonWicketRuns: this.seasonWicketRuns,
            maxWickets: this.maxWickets,
            maxOversPerBowler: this.maxOversPerBowler,
        };
    }

    getIsPlayoffs() {
        return this.isPlayoffs;
    }

}

module.exports = new SettingsStore();
