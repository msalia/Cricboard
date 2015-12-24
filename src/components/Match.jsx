/*
 * Match Component
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var BattingControls = require('BattingControls');
var BowlingControls = require('BowlingControls');
var React = require('react');
var RosterStore = require('RosterStore');
var BowlingStore = require('BowlingStore');
var BattingStore = require('BattingStore');
var ScoreStore = require('ScoreStore');
var Subnav = require('Subnav');

var {
    TeamTypes,
    ScoreTypes,
} = AppConstants;
var cn = require('classnames');

class Match extends React.Component {

    constructor(props) {
        super(props);
        this.state = this._getInitialState();
        this.props = props;
    }

    _getInitialState() {
        return {
            rosters: RosterStore.getRosters(),
            score: ScoreStore.getData(),
            bowling: BowlingStore.getData(),
            batting: BattingStore.getData(),
        };
    }

    _onChange() {
        this.setState(this._getInitialState(), () => {
            if (this.scoreBoard) {
                this.scoreBoard.postMessage(this.state, 'http://localhost');
            }
        });
    }

    componentDidMount() {
        this.bowlingListener = BowlingStore.addChangeListener(this._onChange.bind(this));
        this.battingListener = BattingStore.addChangeListener(this._onChange.bind(this));
        this.scoreListener = ScoreStore.addChangeListener(this._onChange.bind(this));
    }

    componentWillUnmount() {
        this.bowlingListener && this.bowlingListener.remove();
        this.battingListener && this.battingListener.remove();
        this.scoreListener && this.scoreListener.remove();
    }

    render() {
        var goGreen = this.state.bowling.currentBowler != null &&
            this.state.batting.batsman1 != null &&
            this.state.batting.batsman2 != null;

        return (
            <div>
                <div className={cn('row')} style={{ marginBottom: "0px" }}>
                    <Subnav title="Overall Statistics" />
                    {this.renderStatistics()}
                </div>
                <BowlingControls bowlingData={this.state.bowling} goGreen={goGreen} />
                <BattingControls battingData={this.state.batting} goGreen={goGreen} />
            </div>
        );
    }

    renderStatistics() {
        var rosters = RosterStore.getRosters();
        var teams = this.state.score.teams;
        var nextInningButton = !ScoreStore.getIsPlayChanged() ?
            <button type="button" 
                className={cn('btn', 'btn-primary')}
                onClick={this.nextInning.bind(this)}>
                Next Inning
            </button> : null;
        return (
            <div className={cn('boardStatistics')}>
                <div className={cn('col-sm-8', 'boardScoreDisplay')}>
                    <div className={cn('boardScoreDisplayHomeTeam')}>
                        <div className={cn('col-sm-4', 'boardScoreDisplayOvers')}>
                            Overs: {this.getOvers(teams[TeamTypes.HOME].balls)}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayName')}>
                            {rosters.homeTeamRoster.teamName || 'No Team Selected'}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayRuns')}>
                            Runs: {teams[TeamTypes.HOME].runs} / {teams[TeamTypes.HOME].wickets}
                        </div>
                    </div>
                    <div className={cn('boardScoreDisplayAwayTeam')}>
                        <div className={cn('col-sm-4', 'boardScoreDisplayOvers')}>
                            Overs: {this.getOvers(teams[TeamTypes.AWAY].balls)}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayName')}>
                            {rosters.awayTeamRoster.teamName || 'No Team Selected'}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayRuns')}>
                            Runs: {teams[TeamTypes.AWAY].runs} / {teams[TeamTypes.AWAY].wickets}
                        </div>
                    </div>
                </div>
                <div className={cn('col-sm-4', 'boardScoreButtons')}>
                    {nextInningButton}
                    <button type="button" 
                        className={cn('btn', 'btn-default')}
                        onClick={this.openScoreBoard.bind(this)}>
                        Open Scoreboard
                    </button>
                    <button type="button" 
                        className={cn('btn', 'btn-warning')}
                        onClick={() => AppActions.reset()}>
                        Reset
                    </button>
                </div>
            </div>
        );
    }

    nextInning() {
        AppActions.playChange();
        if (this.scoreBoard) {
            this.scoreBoard.postMessage(this.state, 'http://localhost');
        }
    }

    openScoreBoard() {
        if (this.scoreBoard) { 
            this.scoreBoard.close();
            this.scoreBoard = null;
        }
        this.scoreBoard = window.open('scoreboard.html', 'Scoreboard');
        setTimeout(() => this.scoreBoard.postMessage(this.state, 'http://localhost'), 100);
    }

    getOvers(balls) {
        return `${parseInt(balls/6)}.${balls%6}`;
    }

}

module.exports = Match;
