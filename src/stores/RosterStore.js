/*
 * Roster Store
 * @flow
 */

var AppConstants = require('AppConstants');
var BaseStore = require('BaseStore');
var $ = require('jquery');

var {
    ActionTypes,
    TeamTypes,
} = AppConstants;

class RosterStore extends BaseStore {

    constructor() {
        super();
        this.homeTeamId = null;
        this.awayTeamId = null;
        this.teams = [];
        this.homeTeamRoster = {};
        this.awayTeamRoster = {};
        this.fetchingHomeTeam = false;
        this.fetchingAwayTeam = false;
        this.fetchingTeams = false;
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
        this.fetchTeams();
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
        if (this.fetchingHomeTeam) { return; }
        this.fetchingHomeTeam = true;
        this.fetchTeamRoster(TeamTypes.HOME, this.homeTeamId);
        this.emitChange();
    }

    fetchAwayTeamRoster() {
        if (this.fetchingAwayTeam) { return; }
        this.fetchingAwayTeam = true;
        this.fetchTeamRoster(TeamTypes.AWAY, this.awayTeamId);
        this.emitChange();
    }

    fetchTeamRoster(teamType, teamId) {
        $.ajax({
            url: 'http://api.pramukhcup.ca/getTeam',
            data: { id: teamId },
            type: 'GET',
            crossDomain: true,
            jsonpCallback: 'callback',
            dataType: 'jsonp',
        })
        .fail((xhr, status) => {
            console.error('Fetching Team', status);
        })
        .done(data => {
            if (teamType === TeamTypes.HOME) {
                this.homeTeamRoster = data;
            } else {
                this.awayTeamRoster = data;
            }
        })
        .complete(() => {
            if (teamType === TeamTypes.HOME) {
                this.fetchingHomeTeam = false;
            } else {
                this.fetchingAwayTeam = false;
            }
            this.emitChange();
        });
        this.emitChange();
    }

    getRosters() {
        var rosters = {
            homeTeamId: this.homeTeamId,
            awayTeamId: this.awayTeamId,
            homeTeamRoster: this.homeTeamRoster,
            awayTeamRoster: this.awayTeamRoster,
            tossWonBy: this.tossWonBy,
            choseToBat: this.choseToBat,
            fetchingHomeTeam: this.fetchingHomeTeam,
            fetchingAwayTeam: this.fetchingAwayTeam,
        };
        return rosters;
    }

    getTeamsList() {
        return this.teams;
    }

    fetchTeams() {
        if (this.fetchingTeams) { return; }

        this.fetchTeams = true;
        $.ajax({
            url: 'http://api.pramukhcup.ca/getTeams',
            type: 'GET',
            crossDomain: true,
            jsonpCallback: 'callback',
            dataType: 'jsonp',
        })
        .fail((xhr, status) => {
            console.error('Fetching Teams', status);
        })
        .done(data => {
            this.teams = data;
        })
        .complete(() => {
            this.fetchTeams = false;
            this.emitChange();
        });
        this.emitChange();
    }

    isFetchingTeams() {
        return this.fetchingTeams;
    }

}

module.exports = new RosterStore();
