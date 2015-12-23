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

    loadScoreboard() {
        this.dispatch(ActionTypes.LOAD_SCORE_BOARD, {});
    }

    tossWonBy(teamType) {
		this.dispatch(ActionTypes.TOSS_WON_BY, { teamType });
    }

};

module.exports = new AppActions();
