/*
 * Application Initializer
 * @flow
 */

var App = require('App');
var AppActions = require('AppActions');
var AppConstants = require('AppConstants');
var AppDispatcher = require('AppDispatcher');
var ExampleStore = require('ExampleStore');
var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Roster = require('Roster');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;

var {ActionTypes} = AppConstants;

class Initializer {

    constructor() {
        this.application = <App />;
        this.stores = [
            ExampleStore,
        ];
    }

    init(appRoot): void {
        // Perform store initialization
        var dispatchToken = AppDispatcher.register(action => {
            if (action.type === ActionTypes.INIT_LOAD) {
                AppDispatcher.waitFor(
                    this.stores.map(store => store.getDispatchToken())
                );

                // Render the application
                ReactDOM.render(this.application, appRoot);

                ReactDOM.render(
                    (
                        <Router>
                            <Route path="/" component={App}>
                                <Route path="roster" component={Roster}/>
                            </Route>
                        </Router>
                    ), 
                    appRoot
                );
                AppDispatcher.unregister(dispatchToken);
            }
            return;
        });

        // send the initializing action
        AppActions.initLoad();
    }

}

// Let's initialize the application
var initializer = new Initializer();
initializer.init(document.getElementById("app-root"));

module.exports = Initializer;
