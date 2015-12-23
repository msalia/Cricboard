/*
 * Match Component
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var React = require('react');
var RosterStore = require('RosterStore');
var ScoreStore = require('ScoreStore');
var Subnav = require('Subnav');

var {TeamTypes} = AppConstants;
var cn = require('classnames');

class Match extends React.Component {

    constructor(props) {
        super(props);
        this.state = ScoreStore.getData();
        this.props = props;
    }

    _onChange() {
        this.setState(ScoreStore.getData());
    }

    componentDidMount() {
        this.listener = ScoreStore.addChangeListener(this._onChange.bind(this));
    }

    componentWillUnmount() {
        this.listener && this.listener.remove();
    }

    render() {
        return (
            <div>
                <div className={cn('row')} style={{ marginBottom: "0px" }}>
                    <Subnav title="Overall Statistics" />
                    {this.renderStatistics()}
                </div>
                <div className={cn('row')}>
                    <Subnav title="Bowling" />
                    {this.renderBowlingControls()}
                </div>
                <div className={cn('row')}>
                    <Subnav title="Batting" />
                    {this.renderBattingControls()}
                </div>
            </div>
        );
    }

    renderStatistics() {
        var rosters = RosterStore.getRosters();
        return (
            <div className={cn('boardStatistics')}>
                <div className={cn('col-sm-12', 'boardScoreDisplay')}>
                    <div className={cn('boardScoreDisplayHomeTeam')}>
                        <div className={cn('col-sm-4', 'boardScoreDisplayOvers')}>
                            Overs: {this.state.homeTeam.overs}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayName')}>
                            {rosters.homeTeamRoster.teamName || 'Choose A Team'}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayRuns')}>
                            Runs: {this.state.homeTeam.runs} / {this.state.homeTeam.wickets}
                        </div>
                    </div>
                    <div className={cn('boardScoreDisplayAwayTeam')}>
                        <div className={cn('col-sm-4', 'boardScoreDisplayOvers')}>
                            Overs: {this.state.awayTeam.overs}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayName')}>
                            {rosters.awayTeamRoster.teamName || 'Choose A Team'}
                        </div>
                        <div className={cn('col-sm-4', 'boardScoreDisplayRuns')}>
                            Runs: {this.state.awayTeam.runs} / {this.state.awayTeam.wickets}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderStatBox(statBoxes) {
        var stats = [];
        statBoxes.forEach((box, index) => {
            var middot = box.middot ? <span className={cn('middot')} /> : null;
            stats.push(
                <div key={index} className={cn('bowlingStatBox')}>
                    <span className={cn('bowlingStatBoxTitle')}>
                        {middot}
                        {box.title}
                    </span>
                    <b>{box.value}</b>
                </div>
            );
        });

        return <div>{stats}</div>;
    }

    renderBowlingButtons() {
        var buttonClasses = cn('btn', 'btn-default');
        var bowlerSelect = true || this.state.currentOver.balls === 6 ?
            <div className="btn-group">
                <button type="button" className="btn btn-default">
                    Choose Next Bowler
                </button>
                <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                    <span className="caret"></span>
                    <span className="sr-only">Toggle Dropdown</span>
                </button>
                <ul className="dropdown-menu">
                    {this.renderRosterNames(this.state.bowlingTeam)}
                </ul>
            </div> : null;

        return (
            <div>
                <div className={cn('col-sm-12')}>
                    Extra: &nbsp;
                    <div className={cn('btn-group')} role="group">
                        <button type="button" className={buttonClasses}>Wide</button>
                        <button type="button" className={buttonClasses}>No Ball</button>
                        <button type="button" className={buttonClasses}>Wicket</button>
                    </div>
                </div>
                <div className={cn('col-sm-12')} style={{ margin: "15px 0" }}>
                    Runs: &nbsp;
                    <div className={cn('btn-group')} role="group">
                        <button type="button" className={buttonClasses}>0</button>
                        <button type="button" className={buttonClasses}>2</button>
                        <button type="button" className={buttonClasses}>4</button>
                        <button type="button" className={buttonClasses}>6</button>
                        <button type="button" className={buttonClasses}>+1</button>
                        <button type="button" className={buttonClasses}>-1</button>
                    </div>
                </div>
                <div className={cn('col-sm-12')}>
                    {bowlerSelect}
                </div>
            </div>
        );
    }

    renderRosterNames(teamType, callback) {
        var teamList = RosterStore.getRosters();
        teamList = (teamType === TeamTypes.HOME) 
            ? teamList.homeTeamRoster : teamList.awayTeamRoster;
        teamList.players = teamList.players || [];
        var teamDropdown = [];
        if (teamList.players.length <= 0) {
            teamDropdown.push(<li key={0}><a>Choose A Team</a></li>);
        } else {
            teamList.players.forEach((player, index) => {
                teamDropdown.push(
                    <li key={index}>
                        <a onClick={e => callback(e, player.id)}>
                            {`${player.first} ${player.last}`}
                        </a>
                    </li>
                );
            });
        }
        return teamDropdown;
    }

    renderDataTable(data, statsCallback) {
        var rows = [];
        data.forEach((player, index) => {
            rows.push(
                <tr key={index}>
                    <td>{player.id}</td>
                    <td>{player.first}</td>
                    <td>{player.last}</td>
                    <td>{statsCallback(player)}</td>
                </tr>
            );
        })

        return (
            <table className={cn('table')}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Stats</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    }

    renderBowlingControls() {
        var stats = [
            { title: 'Runs This Over', value: this.state.currentOver.runs || 0 },
            { title: 'Balls Bowled', value: this.state.currentOver.balls || 0 },
            { title: 'Bowler', value: this.state.bowler.name || 'None' },
        ];
        return (
            <div className={cn('bowlingStatistics')}>
                <div>
                    <div className={cn('col-sm-6', 'bowlingOverview')}>
                        {this.renderStatBox(stats)}
                    </div>
                    <div className={cn('col-sm-6', 'bowlingControls')}>
                        {this.renderBowlingButtons()}
                    </div>
                    <div className={cn('col-sm-12', 'bowlingList')}>
                        {this.renderDataTable(this.state.bowlers, bowler => {
                            return `bowling stats`;
                        })}
                    </div>
                </div>
            </div>
        );
    }

    renderBattingControls() {
        var b1 = this.state.batsman1;
        var b2 = this.state.batsman2;
        var stats = [
            { title: `${b1.name || 'Batsman 1'}`, value: b1.score || 0, middot: true },
            { title: `${b2.name || 'Batsman 2'}`, value: b2.score || 0 },
        ];
        return (
            <div className={cn('bowlingStatistics')}>
                <div className={cn('col-sm-6', 'bowlingOverview')}>
                    {this.renderStatBox(stats)}
                </div>
                <div className={cn('col-sm-6', 'bowlingControls')}>
                    {this.renderBowlingButtons()}
                </div>
                <div className={cn('col-sm-12', 'bowlingList')}>
                    {this.renderDataTable(this.state.batsman, bowler => {
                        return `batting stats`;
                    })}
                </div>
            </div>
        );
    }

}

module.exports = Match;
