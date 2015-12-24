/*
 * Application Actions
 * @flow
 */

var AppConstants = require('AppConstants');
var AppDispatcher = require('AppDispatcher');

var {ActionTypes} = AppConstants;

class AppActions {

    dispatch(type, data) {
        AppDispatcher.dispatch({ type, ...data });
    }

    initLoad(data) {
        this.dispatch(ActionTypes.INIT_LOAD, data);
    }

    choseToBat(decision) {
		this.dispatch(ActionTypes.CHOSE_TO_BAT, { decision });
    }

    choseTeam(teamType, teamId) {
		this.dispatch(ActionTypes.CHOSE_TEAM, { teamType, teamId });
    }

    clearRoster() {
        this.dispatch(ActionTypes.CLEAR_ROSTER, {});
    }

    chooseBowler(id) {
        this.dispatch(ActionTypes.CHOOSE_BOWLER, { id });
    }

    chooseBatsman(position, id) {
        this.dispatch(ActionTypes.CHOOSE_BATSMAN, { position, id });
    }

    scoreExtra(scoreType) {
        this.dispatch(ActionTypes.SCORE_EXTRA, { scoreType });
    }

    scoreRuns(runs, ballIncre) {
        if (ballIncre == null) {
            ballIncre = true;
        }
        this.dispatch(ActionTypes.SCORE_RUNS, { runs, ballIncre });
    }

    loadScoreboard() {
        this.dispatch(ActionTypes.LOAD_SCORE_BOARD, {});
    }

    tossWonBy(teamType) {
		this.dispatch(ActionTypes.TOSS_WON_BY, { teamType });
    }

    playChange() {
        this.dispatch(ActionTypes.PLAY_CHANGE, {});
    }

    swapBatsman() {
        this.dispatch(ActionTypes.SWAP_BATSMAN, {});
    }

    reset() {
        this.dispatch(ActionTypes.RESET, {});
    }

};

module.exports = new AppActions();
