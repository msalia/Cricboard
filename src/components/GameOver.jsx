/*
 * Game Over Component
 * @flow
 */

var React = require('react');
var RosterStore = require('RosterStore');
var Subnav = require('Subnav');

var cn = require('classnames');

class GameOver extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.data = [];
    }

    render() {
        var rosters = RosterStore.getRosters();
        var rows = [];
        var players = rosters.homeTeamRoster.players || [];
        players = players.concat(rosters.awayTeamRoster.players || []);
        players.sort((p1, p2) => p1.id - p2. id);

        this.data = players;
        this.data.forEach((player, index) => {
            rows.push(
                <tr key={index}>
                    <td>{player.id}</td>
                    <td>{player.first}</td>
                    <td>{player.last}</td>
                    <td>{player.runs || 0}</td>
                    <td>{player.balls || 0}</td>
                    <td>{player.runsAllowed || 0}</td>
                    <td>{player.ballsBowled || 0}</td>
                    <td>{player.wickets || 0}</td>
                </tr>
            );
        });

        return (
            <div className={cn('row')}>
                <Subnav title="Game Over" />
                Add game score stats here
                <div className={cn('col-sm-2')} />
                <div className={cn('col-sm-8')}>
                    <table className={cn('table', 'dataTable')}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>First</th>
                                <th>Last</th>
                                <th>Runs Made</th>
                                <th>Balls Faced</th>
                                <th>Runs Allowed</th>
                                <th>Balls Bowled</th>
                                <th>Wickets</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                    <div className={cn('col-sm-12')} style={{ padding: "15px 0" }}>
                        <button  className={cn('btn', 'btn-primary')}
                            onClick={this.exportCSV.bind(this)}>
                            Download CSV
                        </button>
                    </div>
                </div>
                <div className={cn('col-sm-2')} />
            </div>
        );
    }

    exportCSV() {
        var rosters = RosterStore.getRosters();
        if (rosters.homeTeamRoster.teamName == null || rosters.awayTeamRoster.teamName == null) {
            return;
        }

        var csvContent = "data:text/csv;charset=utf-8,\n";
        csvContent += "id,runs,balls,runs_allowed,balls_bowled,wickets\n";
        this.data.forEach((player, index) => {
            var infoArray = [
                player.id,
                player.runs || 0,
                player.balls || 0,
                player.runsAllowed || 0,
                player.ballsBowled || 0,
                player.wickets || 0,
            ];
           var dataString = infoArray.join(",");
           csvContent += index < this.data.length ? dataString + "\n" : dataString;
        });

        // open download file
        var link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", this.getFileName(rosters));
        link.click();
    }

    getFileName(rosters) {
        var homeTeam = rosters.homeTeamRoster || {};
        var awayTeam = rosters.awayTeamRoster || {};
        var date = new Date();
        return `${homeTeam.teamName}_v_${awayTeam.teamName}_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}.csv`;
    }

}

module.exports = GameOver;
