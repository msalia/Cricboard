/*
 * Game Over Component
 * @flow
 */

var React = require('react');
var Subnav = require('Subnav');

var cn = require('classnames');

class GameOver extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div className={cn('row')}>
                <Subnav title="Game Over" />
            </div>
        );
    }

}

module.exports = GameOver;
