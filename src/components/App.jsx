/*
 * Application Root Component
 * @flow
 */

var React = require('react');
var Navbar = require('Navbar');

var cn = require('classnames');

class App extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div className={cn('container-fluid')}>
                <Navbar tabIndex={this.getTabIndex()} />
                {this.props.children}
            </div>
        );
    }

    getTabIndex() {
        var pathname = this.props.location ? this.props.location.pathname : '';
        switch(pathname) {
            case "/roster":
                return 0;
            case "/match":
                return 1;
            case "/settings":
                return 2;
            default:
                return -1;
        }
    }

}

module.exports = App;
