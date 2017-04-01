'use strict';

var React = require('react');  
var {hashHistory} = require('react-router');
var UserStore = require('./authentication/user-store.js');
var AuthActions = require('./authentication/auth-actions');
var AuthStore = require('./authentication/auth-store');
var Dialog = require('material-ui/lib/dialog');
var CircularProgress = require('material-ui/lib/circular-progress');
var FlatButton = require('material-ui/lib/flat-button');
var alt = require('./alt.js');
var async = require('./util/async.js');
var analytics = require('./util/analytics.js');
var css = require('../styles/app.css');  // eslint-disable-line no-unused-vars
require('react-select/dist/react-select.css');


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            logoutStatus : null,
            showErrorDialog : false,
            error : null
        };
    }

    componentWillMount() {

        var currentRoute = this.props.location.pathname;
        var isAuthenticated = UserStore.isAuthenticated();

        if (isAuthenticated) {
            let user = UserStore.getUser();

            analytics.identify(user._id, {
                email: user.email
            });
        }

        this.authenticateRoute(currentRoute);
    }

    componentWillUpdate(newProps) {
        var newRoute = newProps.location.pathname,
            currentRoute = this.props.location.pathname;

        if (newRoute !== currentRoute) {
            this.authenticateRoute(newRoute);
        }
    }

    componentDidMount() {
        AuthStore.listen(this.onChange);
        UserStore.listen(this.onChange);
    }

    componentWillUnmount() {
        AuthStore.unlisten(this.onChange);
        UserStore.unlisten(this.onChange);
    }

    onChange = (state) => {

        var changeTriggeredStore = state.displayName;

        if (changeTriggeredStore === 'UserStore') {
            if (state.token === null) {
                hashHistory.replace('/login');
            }
        }

        if (changeTriggeredStore === 'AuthStore') {

            var newStatus = state.logoutStatus;

            if (this.state.logoutStatus === newStatus) {
                return;
            }

            this.setState({
                logoutStatus : newStatus
            });

            if (newStatus === 'error') {
                this.setState({
                    showErrorDialog : true,
                    error : `${state.error}. Click OK to login again`
                });
            }

            if (newStatus === 'success') {
                async.then(() => { 
                    alt.dispatcher.dispatch({action : AuthActions.CLEAR_STATUS}); 
                });
            }
        }
        
    }
    
    authenticateRoute(route) {

        if (route) {

            var isAuthenticated = UserStore.isAuthenticated();

            route = route.trim();
            if (route[route.length - 1] === '/') {
                route = route.slice(0,route.length-1);
            }

            if (this.isUnauthenticatedRoute(route)) {
                if (isAuthenticated) {
                    hashHistory.replace('/');
                }
            } else {
                if (!isAuthenticated) {
                    hashHistory.replace('/login');
                }
            } 
        }
    }

    isUnauthenticatedRoute(route) {

        var unauthenticatedRoutes = ['/login','/signup/org',
            '/invite/:id/project','/invite/:id/project/interstitial'];

        var isUnauthenticatedRoute = false;

        unauthenticatedRoutes.forEach(function(unauthenticatedRoute) {

            var t1 = unauthenticatedRoute.split('/');
            var t2 = route.split('/');

            for (let i = 0 ; i< t1.length;i++) {
                if (t1[i].startsWith(':')) {
                    t1[i] = t2[i];
                }
            }

            var t3 = t1.join('/');

            if (t3 === route) {
                isUnauthenticatedRoute = true;
            }

        });

        return isUnauthenticatedRoute;
    }

    handleForceLogout = () => {

        this.setState({
            logoutStatus : null,
            showErrorDialog : false,
            error : null
        });

        alt.dispatcher.dispatch({action : AuthActions.FORCE_LOGOUT});
    }

    render() {

        const actions = [
            <FlatButton
              label='Ok'
              onTouchTap={this.handleForceLogout}
            />           
        ];

        const progressStyle = {
            position : 'fixed',
            top : '110px',
            left : '49%'
        };

        return (
            <div className="root-wrap">

                {this.props.children}

                {(this.state.logoutStatus === 'loading') ? <CircularProgress style={progressStyle}/> : null}

                {this.state.showErrorDialog ? 
                    <div className="error-dialog">
                        <Dialog
                            title="Error"
                            actions={actions}
                            modal={true}
                            ref="errorDialog"
                            open={this.state.showErrorDialog}
                            onRequestClose={this.handleForceLogout}
                        >
                            {this.state.error}
                        </Dialog>
                    </div> : ''}

            </div>
        );
    }

}

module.exports = App;
