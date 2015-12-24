/*
 * Settings Component
 * @flow
 */

var AppActions = require('AppActions');
var React = require('react');
var Subnav = require('Subnav');
var SettingsStore = require('SettingsStore');

var cn = require('classnames');

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = SettingsStore.getData();
    }

    _onChange() {
        this.setState(SettingsStore.getData());
    }

    componentDidMount() {
        this.listener = SettingsStore.addChangeListener(this._onChange.bind(this));
    }

    componentWillUnmount() {
        this.listener && this.listener.remove();
    }

    increment(e, value, callback) {
        callback && callback(++value);
    }

    decrement(e, value, callback) {
        callback && callback(--value);
    }

    renderSettingSections(settings) {
        var sections = [];
        settings.forEach((setting, index) => {
            sections.push(
                <div key={index} className={cn('roster-settings-section')}>
                    <span className={cn('roster-settings-section-title')}>
                        {setting.title}
                    </span>
                    <span className={cn('roster-settings-section-value')}>
                        {setting.value}
                        <div className={cn('btn-group')} role="group">
                            <button type="button" 
                                className={cn('btn', 'btn-default')}
                                onClick={e => this.increment(e, setting.value, setting.callback)}>
                                +
                            </button>
                            <button type="button" 
                                className={cn('btn', 'btn-default')}
                                onClick={e => this.decrement(e, setting.value, setting.callback)}>
                                -
                            </button>
                        </div>
                    </span>
                </div>
            );
        });
        return sections;
    }

    render() {
        var settings = [
            { title: 'Overs', value: this.state.overs, callback: this.setOvers.bind(this) },
            { title: 'Season Wicket Deduction', value: this.state.seasonWicketRuns, callback: this.setSeasonWicketDeduction.bind(this) },
            { title: 'Playoff Wicket Deduction', value: this.state.playoffWicketRuns, callback: this.setPlayoffWicketDeduction.bind(this) },
            { title: 'Max Wickets', value: this.state.maxWickets, callback: this.setMaxWickets.bind(this) },
            { title: 'Max Overs Per Bowler', value: this.state.maxOversPerBowler, callback: this.setMaxOversPerBowler.bind(this) },
        ];
        return (
            <div className={cn('row')}>
                <Subnav title="Settings" />
                <div className={cn('col-sm-12')}>
                    {this.renderSettingSections(settings)}
                </div>
            </div>
        );
    }

    setOvers(count) {
        AppActions.setOvers(count);
    }

    setSeasonWicketDeduction(count) {
        AppActions.setSeasonWicketDeduction(count);
    }

    setPlayoffWicketDeduction(count) {
        AppActions.setPlayoffWicketDeduction(count);
    }

    setMaxWickets(count) {
        AppActions.setMaxWickets(count);
    }

    setMaxOversPerBowler(count) {
        AppActions.setMaxOversPerBowler(count);
    }

}

module.exports = Settings;
