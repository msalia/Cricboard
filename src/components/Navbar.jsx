/*
 * Navbar Component
 * @flow
 */

var React = require('react');
var Link = require('react-router').Link;

var cn = require('classnames');

class Navbar extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div 
                className={cn('row', 'navbar')} 
                style={{ marginBottom: "0px" }}>
                <Link to="/" className={cn('navbar-logo')}>
                    Cricboard
                </Link>
                {this.renderTabs()}
            </div>
        );
    }

    renderTabs() {
        var tabs = [];
        var tabData = [ 
            [ 'Rosters', '/roster' ], 
            [ 'Match', '/match' ], 
            //TODO: [ 'Settings', '/settings' ],
        ];
        tabData.forEach((tab, index) => {
            tabs.push(
                <Link to={tab[1]} key={`navtab_${index}`}
                    className={cn({
                        'navbar-tab': true,
                        'navbar-tab-selected': this.props.tabIndex === index,
                    })}>
                    {tab[0]}
                </Link>
            );
        });
        return tabs;
    }

}

Navbar.propTypes = {
    tabIndex: React.PropTypes.number,
};

Navbar.defaultProps = {
    tabIndex: 0,
};

module.exports = Navbar;
