/*
 * Batting Component
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var React = require('react');
var RosterStore = require('RosterStore');
var BattingStore = require('BattingStore');
var Subnav = require('Subnav');
var StatBox = require('StatBox');

var {
    TeamTypes,
    ScoreTypes,
} = AppConstants;
var cn = require('classnames');

class BattingControls extends React.Component {

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
                <Subnav title="Batting" />
                {this.renderBattingControls()}
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

    renderBattingButtons() {
        var batsman =
            <div className={cn('col-sm-12')} style={{ padding: "0", marginBottom: "15px" }}>
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
                <div className="btn-group">
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
            </div>;

        return (
            <div className={cn('col-sm-12')} style={{ padding: "15px 0" }}>
                {batsman}
                <button type="button" 
                    className={cn('btn', 'btn-primary')}
                    onClick={() => this.props.goGreen && AppActions.swapBatsman()}>
                    Swap Batsman
                </button>
            </div>
        );
    }

    renderBattingControls() {
        var b1 = this.props.battingData.batsman1 || {};
        var b2 = this.props.battingData.batsman2 || {};
        var stats = [
            { title: `B1 ${b1.first || ''} ${b1.last || ''}`, value: b1.runs || 0, middot: true },
            { title: `B2 ${b2.first || ''} ${b2.last || ''}`, value: b2.runs || 0 },
        ];
        return (
            <div className={cn('bowlingStatistics')}>
                <div className={cn('col-sm-6', 'battingOverview')}>
                    <StatBox statBoxes={stats} />
                </div>
                <div className={cn('col-sm-6', 'battingControls')}>
                    {this.renderBattingButtons()}
                </div>
                <div className={cn('col-sm-12', 'bowlingList')}>
                    {this.renderDataTable(this.props.battingData.batsman, batsman => {
                        return `${batsman.runs || 0} (${batsman.balls || 0})`;
                    })}
                </div>
            </div>
        );
    }

}

module.exports = BattingControls;
