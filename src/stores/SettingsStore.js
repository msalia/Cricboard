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
        this.emitChange();
    }

    setupActions() {
        this.addAction(ActionTypes.LOAD_SCORE_BOARD, this.reset);
        this.addAction(ActionTypes.PLAYOFFS_ON_OFF, this.playOffs);
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
        };
    }

    getIsPlayoffs() {
        return this.isPlayoffs;
    }

}

module.exports = new SettingsStore();
