/*
 * Players List Component
 * @flow
 */

var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var React = require('react');
var RosterStore = require('RosterStore');
var BattingStore = require('BattingStore');
var Subnav = require('Subnav');
var StatBox = require('StatBox');
var SweetAlert = require('sweetalert');

var {
    TeamTypes,
    ScoreTypes,
} = AppConstants;
var cn = require('classnames');

class PlayersList extends React.Component {

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
                <Subnav title="Players" />
                {this.renderPlayersList()}
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

    renderDataTable(playerLabel, data, statsCallback) {
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
                        <th>{playerLabel} #</th>
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

    renderPlayersList() {
        var b1 = this.props.battingData.batsman1 || {};
        var b2 = this.props.battingData.batsman2 || {};
        var stats = [
            { title: `B1 ${b1.first || ''} ${b1.last || ''}`, value: b1.runs || 0, middot: true },
            { title: `B2 ${b2.first || ''} ${b2.last || ''}`, value: b2.runs || 0 },
        ];
        return (
            <div className={cn('bowlingStatistics')}>
                <div className={cn('col-sm-6', 'bowlingList')} style={{ borderRight: "1px solid #DDDDDD" }}>
                    {this.renderDataTable('Batsman', this.props.battingData.batsman, batsman => {
                        return `${batsman.runs || 0} (${batsman.balls || 0})`;
                    })}
                </div>
                <div className={cn('col-sm-6', 'bowlingList')}>
                    {this.renderDataTable('Bowler', this.props.bowlingData.bowlers, bowler => {
                        return `${bowler.runsAllowed || 0}-${this.getOvers(bowler.ballsBowled) || '0.0'}-${bowler.wickets || 0}`;
                    })}
                </div>
            </div>
        );
    }

    getOvers(balls) {
        if (balls == null) return '0.0';
        return `${parseInt(balls/6)}.${balls%6}`;
    }

}

module.exports = PlayersList;
