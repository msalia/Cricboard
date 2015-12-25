/*
 * Game Over Component
 * @flow
 */

var AppConstants = require('AppConstants');
var React = require('react');
var RosterStore = require('RosterStore');
var ScoreStore = require('ScoreStore');
var Subnav = require('Subnav');
var SweetAlert = require('sweetalert');

var {TeamTypes} = AppConstants;
var cn = require('classnames');

class GameOver extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.playerData = [];
        this.matchData = [];
    }

    genPlayerStats() {
        var rosters = RosterStore.getRosters();
        var rows = [];
        var players = rosters.homeTeamRoster.players || [];
        players = players.concat(rosters.awayTeamRoster.players || []);
        players.sort((p1, p2) => p1.id - p2. id);

        this.playerData = players;
        this.playerData.forEach((player, index) => {
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
        return rows;
    }

    genTeamRows() {
        var rosters = RosterStore.getRosters();
        var score = ScoreStore.getData();
        var rows = [];
        var homeTeam = rosters.homeTeamRoster;
        var awayTeam = rosters.awayTeamRoster;

        if (rosters.homeTeamId == null || rosters.awayTeamId == null) {
            return rows;
        }

        this.matchData = [
            {
                teamId: rosters.homeTeamId || '-',
                teamName: homeTeam.teamName || 'None Selected',
                runs: score.teams[TeamTypes.HOME].runs,
                wickets: score.teams[TeamTypes.HOME].wickets,
                balls: score.teams[TeamTypes.HOME].balls,
                tossWon: rosters.tossWonBy === TeamTypes.HOME ? 'Yes' : 'No',
                choseTo: rosters.tossWonBy === TeamTypes.HOME 
                    ? (rosters.choseToBat ? 'BAT' : 'BOWL') : null,
            },
            {
                teamId: rosters.awayTeamId || '-',
                teamName: awayTeam.teamName || 'None Selected',
                runs: score.teams[TeamTypes.AWAY].runs,
                wickets: score.teams[TeamTypes.AWAY].wickets,
                balls: score.teams[TeamTypes.AWAY].balls,
                tossWon: rosters.tossWonBy === TeamTypes.AWAY ? 'Yes' : 'No',
                choseTo: rosters.tossWonBy === TeamTypes.AWAY 
                    ? (rosters.choseToBat ? 'BAT' : 'BOWL') : null,
            }
        ];

        this.matchData.forEach((team, index) => {
            rows.push(
                <tr key={index}>
                    <td>{team.teamId}</td>
                    <td>{team.teamName}</td>
                    <td>{team.runs}</td>
                    <td>{team.wickets}</td>
                    <td>{this.getOvers(team.balls)}</td>
                    <td>{team.tossWon}</td>
                    <td>{team.choseTo}</td>
                </tr>
            );
        });
        return rows;
    }

    renderMatchStats() {
        return (
            <table className={cn('table', 'dataTable')}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Team</th>
                        <th>Runs</th>
                        <th>Wickets</th>
                        <th>Overs</th>
                        <th>Toss Won</th>
                        <th>Chose To</th>
                    </tr>
                </thead>
                <tbody>
                    {this.genTeamRows()}
                </tbody>
            </table>
        );
    }

    renderPlayerStats() {
        return (
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
                    {this.genPlayerStats()}
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <div className={cn('row')}>
                <Subnav title="Game Over" />
                <div className={cn('col-sm-2')} />
                <div className={cn('col-sm-8')}>
                    <div className={cn('dataTableTitle')}>
                        Actions
                    </div>
                    <div className={cn('gameOverActions')}>
                        <button  className={cn('btn', 'btn-info')}
                            onClick={this.exportMatchCSV.bind(this)}>
                            Download Match CSV
                        </button>
                        <button  className={cn('btn', 'btn-info')}
                            onClick={this.exportPlayerCSV.bind(this)}>
                            Download Player Stat CSV
                        </button>
                        <button  className={cn('btn', 'btn-default')}
                            onClick={this.startNewGame.bind(this)}>
                            Start New Game
                        </button>
                    </div>
                    <div className={cn('dataTableTitle')}>
                        Match Stats
                    </div>
                    <div>
                        {this.renderMatchStats()}
                    </div>
                    <div className={cn('dataTableTitle')}>
                        Player Stats
                    </div>
                    <div>
                        {this.renderPlayerStats()}
                    </div>
                    <div className={cn('acknowledgement')}>
                        Thank You & Jay Swaminarayan!
                        <span className={cn('copyright')}>
                            Copyright &copy; BAPS Inc. 2015
                        </span>
                    </div>
                </div>
                <div className={cn('col-sm-2')} />
            </div>
        );
    }

    exportMatchCSV() {
        var csvContent = "data:text/csv;charset=utf-8,\n";
        csvContent += "id,name,runs,wickets,overs,tossWon,choseTo\n";
        this.matchData.forEach((team, index) => {
            var infoArray = [
                team.teamId,
                team.teamName,
                team.runs || 0,
                team.wickets || 0,
                this.getOvers(team.balls) || 0,
                team.tossWon || 'No',
                team.choseTo || '',
            ];
           var dataString = infoArray.join(",");
           csvContent += index < this.matchData.length ? dataString + "\n" : dataString;
        });

        // open download file
        var link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `MATCH_STATS_${this.getFileName(RosterStore.getRosters())}`);
        link.click();
    }

    exportPlayerCSV() {
        var rosters = RosterStore.getRosters();
        if (rosters.homeTeamRoster.teamName == null || rosters.awayTeamRoster.teamName == null) {
            return;
        }

        var csvContent = "data:text/csv;charset=utf-8,\n";
        csvContent += "id,runs,balls,runs_allowed,balls_bowled,wickets\n";
        this.playerData.forEach((player, index) => {
            var infoArray = [
                player.id,
                player.runs || 0,
                player.balls || 0,
                player.runsAllowed || 0,
                player.ballsBowled || 0,
                player.wickets || 0,
            ];
           var dataString = infoArray.join(",");
           csvContent += index < this.playerData.length ? dataString + "\n" : dataString;
        });

        // open download file
        var link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `PLAYER_STATS_${this.getFileName(rosters)}`);
        link.click();
    }

    getFileName(rosters) {
        var homeTeam = rosters.homeTeamRoster || {};
        var awayTeam = rosters.awayTeamRoster || {};
        var date = new Date();
        return `${homeTeam.teamName}_v_${awayTeam.teamName}_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}.csv`;
    }

    startNewGame() {
        SweetAlert({   
            title: "Are you sure?",  
            text: "You will not be able to download these stats ever again!",   
            type: "error",
            showCancelButton: true,
            confirmButtonText: "OK",   
            closeOnConfirm: true, 
        },
        () => {
            window.location = "http://localhost/";
        });
    }

    getOvers(balls) {
        return `${parseInt(balls/6)}.${balls%6}`;
    }

}

module.exports = GameOver;
