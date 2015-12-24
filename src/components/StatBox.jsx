/*
 * Statbox Component
 * @flow
 */

var React = require('react');

var cn = require('classnames');

class StatBox extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
    		var statBoxes = this.props.statBoxes || [];
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

}

StatBox.propTypes = {
	statBoxes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

module.exports = StatBox;
