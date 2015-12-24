/*
 * Application Constants
 * @flow
 */

var keyMirror = require('keyMirror');

var AppConstants = {

    ActionTypes: keyMirror({
      	INIT_LOAD: null,
      	CHOSE_TO_BAT: null,
      	CHOSE_TEAM: null,
        CHOOSE_BOWLER: null,
        CHOOSE_BATSMAN: null,
        SET_OVERS: null,
        SET_PLAYOFF_WICKET_DEDUCTION: null,
        SET_SEASON_WICKET_DEDUCTION: null,
        SET_MAX_WICKETS: null,
        SET_MAX_OVERS_PER_BOWLER: null,
        SCORE_EXTRA: null,
        SCORE_RUNS: null,
        SWAP_BATSMAN: null,
        CLEAR_ROSTER: null,
        LOAD_SCORE_BOARD: null,
        PLAY_CHANGE: null,
        GAME_OVER: null,
        RESET: null,
      	TOSS_WON_BY: null,
        PLAYOFFS_ON_OFF: null,
    }),

    TeamTypes: keyMirror({
    		HOME: null,
    		AWAY: null,
    }),

    ScoreTypes: keyMirror({
        WIDE: null,
        NO_BALL: null,
        WICKET: null,
        RUNS: null
    }),

};

module.exports = AppConstants;
