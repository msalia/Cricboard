/*
 * Subnav Component
 * @flow
 */

var React = require('react');

var cn = require('classnames');

class Subnav extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div className={cn('full-width', 'subnav')}>
                <span className={cn('subnav-title')}>
                    {this.props.title}
                </span>
            </div>
        );
    }

}

module.exports = Subnav;
