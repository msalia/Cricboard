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
        CLEAR_ROSTER: null,
        LOAD_SCORE_BOARD: null,
      	TOSS_WON_BY: null,
    }),

    TeamTypes: keyMirror({
    		HOME: null,
    		AWAY: null,
    })

};

module.exports = AppConstants;
