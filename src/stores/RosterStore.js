/*
 * Roster Store
 * @flow
 */

var AppConstants = require('AppConstants');
var BaseStore = require('BaseStore');

var {
    ActionTypes,
    TeamTypes,
} = AppConstants;

class RosterStore extends BaseStore {

    constructor() {
        super();
        this.homeTeamId = null;
        this.awayTeamId = null;
        this.homeTeamRoster = {};
        this.awayTeamRoster = {};
        this.tossWonBy = TeamTypes.HOME;
        this.choseToBat = false;
        this.setupActions();
    }

    setupActions() {
        this.addAction(ActionTypes.INIT_LOAD, this.initLoad);
        this.addAction(ActionTypes.CHOSE_TO_BAT, this.chosePlay);
        this.addAction(ActionTypes.CHOSE_TEAM, this.choseTeam);
        this.addAction(ActionTypes.CLEAR_ROSTER, this.reset);
        this.addAction(ActionTypes.TOSS_WON_BY, this.choseToss);
    }

    initLoad(action) {
        this.emitChange();
    }

    reset() {
        this.homeTeamId = null;
        this.awayTeamId = null;
        this.homeTeamRoster = {};
        this.awayTeamRoster = {};
        this.tossWonBy = TeamTypes.HOME;
        this.choseToBat = false;
        this.emitChange();
    }

    choseTeam(action) {
        if (action.teamType === TeamTypes.HOME) {
            this.homeTeamId = action.teamId;
            this.fetchHomeTeamRoster();
        } else {
            this.awayTeamId = action.teamId;
            this.fetchAwayTeamRoster();
        }
        this.emitChange();
    }

    chosePlay(action) {
        this.choseToBat = action.decision;
        this.emitChange();
    }

    choseToss(action) {
        this.tossWonBy = action.teamType;
        this.emitChange();
    }

    fetchHomeTeamRoster() {
        // TODO: fetch
        console.log('fetching home team');
        this.homeTeamRoster = this.fetchTeamRoster(this.homeTeamId);
        this.emitChange();
    }

    fetchAwayTeamRoster() {
        // TODO: fetch
        console.log('fetching away team');
        this.awayTeamRoster = this.fetchTeamRoster(this.awayTeamId);
        this.emitChange();
    }

    fetchTeamRoster(teamId) {
        // TODO: fetch from server
        return {
            total: 4,
            teamName: 'Toronto Tigers',
            players: [
                { id: 1001, first: 'Mukund', last: 'Salia' },
                { id: 1002, first: 'Mukund', last: 'Salia' },
                { id: 1003, first: 'Mukund', last: 'Salia' },
                { id: 1004, first: 'Mukund', last: 'Salia' },
            ],
        };
    }

    getRosters() {
        var rosters = {
            homeTeamId: this.homeTeamId,
            awayTeamId: this.awayTeamId,
            homeTeamRoster: this.homeTeamRoster,
            awayTeamRoster: this.awayTeamRoster,
            tossWonBy: this.tossWonBy,
            choseToBat: this.choseToBat,
        };
        return rosters;
    }

    getTeamsList() {
        return [
            {id: 0, label: 'Team 0'},
            {id: 1, label: 'Team 1'},
            {id: 2, label: 'Team 2'},
            {id: 3, label: 'Team 3'},
        ];
    }

}

module.exports = new RosterStore();
