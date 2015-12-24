/*
 * Roster Tab Component
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var Link = require('react-router').Link;
var React = require('react');
var RosterStore = require('RosterStore');
var Subnav = require('Subnav');

var {TeamTypes} = AppConstants;
var cn = require('classnames');

class Roster extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = RosterStore.getRosters();

        this.homeTeam = 'Home Team';
        this.awayTeam = 'Away Team';
    }

    _onChange() {
        this.setState(RosterStore.getRosters());
    }

    componentDidMount() {
        this.listener = RosterStore.addChangeListener(this._onChange.bind(this));
    }

    componentWillUnmount() {
        this.listener && this.listener.remove();
    }

    render() {
        return (
            <div 
                className={cn('row')} 
                style={{ marginBottom: "0px" }}>
                <Subnav title="Team Selection" />
                {this.renderTeamSelections()}
                
                <Subnav title="Game Settings" />
                {this.renderSettingsSections()}
            </div>
        );
    }

    renderTeamDetails(roster) {
        var rows = [];
        var players = roster.players || [];
        players.forEach((player, index) => {
            rows.push(
                <tr key={index}>
                    <td>{player.id}</td>
                    <td>{player.first}</td>
                    <td>{player.last}</td>
                </tr>
            );
        });
        return (
            <div className={cn('teamDetails')}>
                <span className={cn('teamDetailsName')}>
                    {roster.teamName}
                </span>
                <table className={cn('table')}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>First</th>
                            <th>Last</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }

    renderTeam(label, roster, onClick) {
        var teamList = RosterStore.getTeamsList();
        var teamDropdown = [];
        teamList.forEach(team => {
            teamDropdown.push(
                <li key={team.id}>
                    <a onClick={e => onClick(e, team.id)}>
                        {team.label}
                    </a>
                </li>
            );
        });

        return (
            <div className={cn('roster-team-selection-team')}>
                {label}<br/>
                <div className="btn-group">
                    <button type="button" className="btn btn-default">
                        Teams
                    </button>
                    <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                        <span className="caret"></span>
                        <span className="sr-only">Toggle Dropdown</span>
                    </button>
                    <ul className="dropdown-menu">
                        {teamDropdown}
                    </ul>
                </div>
                {roster.teamName ? this.renderTeamDetails(roster) : null}
            </div>
        );
    }

    renderTeamSelections() {
        return (
            <div className={cn('roster-team-selection')}>
                {this.renderTeam(
                    this.homeTeam, 
                    this.state.homeTeamRoster || {}, 
                    (e, team) => this.teamSelected(e, TeamTypes.HOME, team)
                )}
                {this.renderTeam(
                    this.awayTeam,
                    this.state.awayTeamRoster || {},
                    (e, team) => this.teamSelected(e, TeamTypes.AWAY, team)
                )}
            </div>
        );
    }

    renderSettingSection(title, btns, onClick) {
        var btnList = [];
        btns.forEach((btn, index) => {
            btnList.push(
                <button 
                    key={index} 
                    type="button" 
                    className={cn({
                        'btn': true, 
                        'btn-default': true,
                        'btn-selected': btn.selected,
                    })}
                    onClick={e => onClick(e, btn.value)}>
                    {btn.title}
                </button>
            );
        });

        return (
            <div className={cn('roster-settings-section')}>
                <span className={cn('roster-settings-section-title')}>
                    {title}
                </span>
                <div className={cn('btn-group')} role="group">
                    {btnList}
                </div>
            </div>
        );
    }

    renderSettingsSections() {
        var continueBtn = this.isRosterValid()
            ?   <Link 
                    to="/match" 
                    className={cn('btn', 'btn-primary')}
                    onClick={this.onContinue.bind(this)}>
                    Continue
                </Link>
            : null;
        return (
            <div>
                {
                    this.renderSettingSection(
                        'Toss won by:', 
                        [   
                            {
                                title: this.homeTeam,
                                value: TeamTypes.HOME,
                                selected: this.state.tossWonBy === TeamTypes.HOME,
                            },
                            { 
                                title: this.awayTeam,
                                value: TeamTypes.AWAY,
                                selected: this.state.tossWonBy === TeamTypes.AWAY,
                            }
                        ],
                        this.onTossWon.bind(this)
                    )
                }
                {
                    this.renderSettingSection(
                        'Chose to bat:', 
                        [   
                            {
                                title: 'Bat',
                                value: 'Bat',
                                selected: this.state.choseToBat,
                            },
                            { 
                                title: 'Bowl',
                                value: 'Bowl',
                                selected: !this.state.choseToBat,
                            }
                        ],
                        this.onPlayChosen.bind(this)
                    )
                }
                <div className={cn('roster-settings-section')}>
                    <a className={cn('btn', 'btn-default')} 
                        style={{ marginRight: "10px" }}
                        onClick={this.onClear.bind(this)}>
                        Clear
                    </a>
                    {continueBtn}
                </div>
            </div>
        );
    }

    teamSelected(e, teamType, team) {
        AppActions.choseTeam(teamType, team);
    }

    isRosterValid() {
        return this.state.homeTeamId != null && this.state.awayTeamId != null;
    }

    onTossWon(e, teamType) {
        AppActions.tossWonBy(teamType);
    }

    onPlayChosen(e, decision) {
        AppActions.choseToBat(decision);
    }

    onClear(e) {
        AppActions.clearRoster();
    }

    onContinue() {
        AppActions.loadScoreboard();
    }

}

module.exports = Roster;
