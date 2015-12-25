/*
 * Controls Component
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var React = require('react');
var RosterStore = require('RosterStore');
var Subnav = require('Subnav');
var StatBox = require('StatBox');
var SettingsStore = require('SettingsStore');
var SweetAlert = require('sweetalert');

var {
    TeamTypes,
    ScoreTypes,
} = AppConstants;
var cn = require('classnames');

class Controls extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    shouldComponentUpdate() {
        return true;
    }

    render() {
        this.alertUserForInput();
        return (
            <div className={cn('row')}>
                <Subnav title="Controls" />
                {this.renderControls()}
            </div>
        );
    }

    alertUserForInput() {
        var rosters = RosterStore.getRosters();

        if (rosters.homeTeamId == null || rosters.awayTeamId == null) {
            SweetAlert({   
                title: "Choose Teams",  
                text: "You will not be able to proceed without choosing teams!",   
                type: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Let's go choose",
                closeOnConfirm: true,
            },
            isConfirm => {   
                if (isConfirm) {
                    window.location = 'http://localhost/#/roster';
                }
            });
        } else if (this.props.bowlingData.currentBowler == null) {
            SweetAlert({   
                title: "Choose a Bowler",  
                text: "You will not be able to proceed without choosing a bowler!",   
                type: "warning",
                confirmButtonText: "OK",   
                closeOnConfirm: true, 
            });
        } else if (this.props.battingData.batsman1 == null ||
            this.props.battingData.batsman2 == null) {
            SweetAlert({   
                title: "Choose Batsman",  
                text: "You will not be able to proceed without choosing batsmen!",   
                type: "warning",
                confirmButtonText: "OK",   
                closeOnConfirm: true, 
            });
        }
    }

    renderButtons() {
        var buttonClasses = cn('btn', 'btn-default');
        return (
            <div>
                <div className={cn('col-sm-12')}>
                    Auxillary: &nbsp;
                    <div className={cn('btn-group')} role="group">
                        <button type="button" 
                            className={cn({ 'btn': true, 'btn-default': true, 'btn-primary': this.props.bowlingData.isExtra })} 
                            onClick={() => this.props.goGreen && AppActions.scoreExtra(ScoreTypes.EXTRA)}>
                            Extra
                        </button>
                        <button type="button" 
                            className={cn({ 'btn': true, 'btn-default': true, 'btn-primary': this.props.bowlingData.isWicket })} 
                            onClick={() => this.props.goGreen && AppActions.scoreExtra(ScoreTypes.WICKET)}>
                            Wicket
                        </button>
                    </div>
                </div>
                <div className={cn('col-sm-12')} style={{ margin: "15px 0" }}>
                    Runs: &nbsp;
                    <div className={cn('btn-group')} role="group">
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(0)}>0</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(1)}>1</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(2)}>2</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(3)}>3</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(4)}>4</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(6)}>6</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(1, false)}>+1</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(-1, false)}>-1</button>
                    </div>
                    &nbsp;&nbsp;Balls: &nbsp;
                    <div className={cn('btn-group')} role="group">
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreBalls(1)}>+1</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreBalls(-1)}>-1</button>
                    </div>
                </div>
                <div className={cn('col-sm-12')}>
                    Bowler: &nbsp;
                    <div className="btn-group" style={{ marginRight: "15px" }}>
                        <button type="button" className="btn btn-default">
                            Choose Next Bowler
                        </button>
                        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                            <span className="caret"></span>
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                            {this.renderRosterNames(
                                this.props.bowlingData.bowlingTeamRoster, 
                                (_, id) => AppActions.chooseBowler(id)
                            )}
                        </ul>
                    </div>
                </div>
                <div className={cn('col-sm-12')} style={{ marginTop: "15px" }}>
                    Batsmen: &nbsp;
                    <div className="btn-group" style={{ marginRight: "15px" }}>
                        <button type="button" className="btn btn-default">
                            Choose B1
                        </button>
                        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                            <span className="caret"></span>
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                            {this.renderRosterNames(
                                this.props.battingData.battingTeamRoster,
                                (_, id) => AppActions.chooseBatsman(1, id)
                            )}
                        </ul>
                    </div>
                    <div className="btn-group" style={{ marginRight: "15px" }}>
                        <button type="button" className="btn btn-default">
                            Choose B2
                        </button>
                        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                            <span className="caret"></span>
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                            {this.renderRosterNames(
                                this.props.battingData.battingTeamRoster,
                                (_, id) => AppActions.chooseBatsman(2, id)
                            )}
                        </ul>
                    </div>
                    <button type="button" 
                        className={cn('btn', 'btn-primary')}
                        onClick={() => this.props.goGreen && AppActions.swapBatsman()}>
                        Swap Batsman
                    </button>
                </div>
            </div>
        );
    }

    renderRosterNames(roster, callback) {
        var teamDropdown = [];
        if (roster.length <= 0) {
            teamDropdown.push(<li key={'error'}><a>Choose A Team</a></li>);
        } else {
            roster.forEach((player, index) => {
                teamDropdown.push(
                    <li key={'player_'+index}>
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

    renderControls() {
        var data = this.props.bowlingData || {};
        var bowler = data.currentBowler || null;
        var b1 = this.props.battingData.batsman1 || {};
        var b2 = this.props.battingData.batsman2 || {};
        var stats = [
            { title: 'Runs This Over', value: this.calcRuns(data.currentOver) || 0 },
            { title: 'Current Over', value: this.printOver(data.currentOver) || '-' },
            { title: 'Bowler', value: bowler ? `${bowler.first} ${bowler.last}` : 'None' },
            { title: 'Total Extras', value: this.props.bowlingData.extras || 0 },
            { title: `B1 ${b1.first || ''} ${b1.last || ''}`, value: b1.runs || 0, middot: true },
            { title: `B2 ${b2.first || ''} ${b2.last || ''}`, value: b2.runs || 0 },
        ];
        return (
            <div className={cn('bowlingStatistics')}>
                <div>
                    <div className={cn('col-sm-6', 'bowlingOverview')}>
                        <StatBox statBoxes={stats} />
                    </div>
                    <div className={cn('col-sm-6', 'bowlingControls')}>
                        {this.renderButtons()}
                    </div>
                </div>
            </div>
        );
    }

    printOver(over) {
        var text = '';
        over.forEach(ball => {
            text += ball + '-';
        });
        return text.substr(0, text.length-1);
    }

    calcRuns(over) {
        var total = 0;
        var settings = SettingsStore.getData();
        var deduction = settings.isPlayoffs ? settings.playoffWicketRuns : settings.seasonWicketRuns;
        over.forEach(ball => {
            if (typeof ball === 'string') {
                var type = ball.substr(0,2);
                switch (type) {
                    case 'W:':
                        total -= deduction;
                        total += parseInt(ball.substr(2));
                        break;
                    case 'E:':
                        total += parseInt(ball.substr(2)) + 1;
                        break;
                }
            } else {
                total += ball;
            }
        });
        return total;
    }

}

module.exports = Controls;
