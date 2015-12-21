/*
 * Roster Tab Component
 * @flow
 */

var React = require('react');
var Subnav = require('Subnav');

var cn = require('classnames');

class Roster extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            selectedHomeTeam: '',
            selectedAwayTeam: '',
            tossWonBy: '',
            choseToBat: false,
        };

        this.BAT = 1;
        this.BOWL = 2;
        this.homeTeam = 'Home Team';
        this.awayTeam = 'Away Team';
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

    renderTeam(label, onClick) {
        var teamList = [{id: 0, label: 'Team 0'}];
        var teamDropdown = [];
        teamList.forEach(team => {
            teamDropdown.push(
                <li key={team.id}>
                    <a onClick={e => onClick(e, team)}>
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
            </div>
        );
    }

    renderTeamSelections() {
        return (
            <div className={cn('roster-team-selection')}>
                {this.renderTeam(this.homeTeam, (e, team) => this.teamSelected(e, this.homeTeam, team))}
                {this.renderTeam(this.awayTeam, (e, team) => this.teamSelected(e, this.awayTeam, team))}
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
                    onClick={e => onClick(e, btn.value ? btn.value : btn.title)}>
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
        return (
            <div>
                {
                    this.renderSettingSection(
                        'Toss won by:', 
                        [   
                            {
                                title: this.homeTeam,
                                selected: this.state.tossWonBy === this.homeTeam,
                            },
                            { 
                                title: this.awayTeam,
                                selected: this.state.tossWonBy === this.awayTeam,
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
                                value: this.BAT,
                                selected: this.state.choseToBat,
                            },
                            { 
                                title: 'Bowl',
                                value: this.BOWL,
                                selected: !this.state.choseToBat,
                            }
                        ],
                        this.onPlayChosen.bind(this)
                    )
                }
            </div>
        );
    }

    teamSelected(e, teamType, team) {
        var state = {};
        if (teamType === this.homeTeam) {
            state.selectedHomeTeam = team.label;
        } else {
            state.selectedAwayTeam = team.label;
        }
        this.setState(state);
    }

    onTossWon(e, title) {
        this.setState({ tossWonBy: title });
    }

    onPlayChosen(e, decision) {
        this.setState({ choseToBat: decision === this.BAT });
    }

}

module.exports = Roster;
