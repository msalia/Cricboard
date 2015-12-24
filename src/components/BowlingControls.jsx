/*
 * Bowling Component
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var React = require('react');
var RosterStore = require('RosterStore');
var Subnav = require('Subnav');
var StatBox = require('StatBox');

var {
    TeamTypes,
    ScoreTypes,
} = AppConstants;
var cn = require('classnames');

class BowlingControls extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    shouldComponentUpdate() {
        return true;
    }

    render() {
        return (
            <div className={cn('row')}>
                <Subnav title="Bowling" />
                {this.renderBowlingControls()}
            </div>
        );
    }

    renderBowlingButtons() {
        var buttonClasses = cn('btn', 'btn-default');
        var bowlerSelect = this.props.bowlingData.changeBowler ?
            <div className="btn-group">
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
            </div> : null;

        return (
            <div>
                <div className={cn('col-sm-12')}>
                    Extra: &nbsp;
                    <div className={cn('btn-group')} role="group">
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreExtra(ScoreTypes.WIDE)}>Wide</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreExtra(ScoreTypes.NO_BALL)}>No Ball</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreExtra(ScoreTypes.WICKET)}>Wicket</button>
                    </div>
                </div>
                <div className={cn('col-sm-12')} style={{ margin: "15px 0" }}>
                    Runs: &nbsp;
                    <div className={cn('btn-group')} role="group">
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(0)}>0</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(1)}>1</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(2)}>2</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(4)}>4</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(6)}>6</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(1, false)}>+1</button>
                        <button type="button" className={buttonClasses} onClick={() => this.props.goGreen && AppActions.scoreRuns(-1, false)}>-1</button>
                    </div>
                </div>
                <div className={cn('col-sm-12')}>
                    {bowlerSelect}
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

    renderBowlingControls() {
        var data = this.props.bowlingData || {};
        var bowler = data.currentBowler || null;
        var stats = [
            { title: 'Runs This Over', value: this.calcRuns(data.currentOver) || 0 },
            { title: 'Current Over', value: this.printOver(data.currentOver) || '-' },
            { title: 'Bowler', value: bowler ? `${bowler.first} ${bowler.last}` : 'None' },
        ];
        return (
            <div className={cn('bowlingStatistics')}>
                <div>
                    <div className={cn('col-sm-6', 'bowlingOverview')}>
                        <StatBox statBoxes={stats} />
                    </div>
                    <div className={cn('col-sm-6', 'bowlingControls')}>
                        {this.renderBowlingButtons()}
                    </div>
                    <div className={cn('col-sm-12', 'bowlingList')}>
                        {this.renderDataTable(this.props.bowlingData.bowlers, bowler => {
                            return `${bowler.runsAllowed || 0}-${this.getOvers(bowler.ballsBowled) || '0.0'}-${bowler.wickets || 0}`;
                        })}
                    </div>
                </div>
            </div>
        );
    }

    calcRuns(over) {
        var total = 0;
        over.forEach(ball => {
            switch(ball) {
                case 'W':
                    total -= 3;
                    break;
                case 'Wd':
                case 'Nb':
                    total += 1;
                    break;
                default:
                    total += ball;
            }
        });
        return total;
    }

    printOver(over) {
        var text = '';
        over.forEach(ball => {
            text += ball + '-';
        });
        return text.substr(0, text.length-1);
    }

    getOvers(balls) {
        if (balls == null) return '0.0';
        return `${parseInt(balls/6)}.${balls%6}`;
    }

}

module.exports = BowlingControls;
