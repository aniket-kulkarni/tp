var React = require('react');
var LoginView = require('./login-view.jsx');
var AuthStore = require('./auth-store');
var AuthActions = require('./auth-actions');
var {hashHistory} = require('react-router');
var css = require('./login.css');
var analytics = require('../util/analytics.js');
var UserStore = require('./user-store.js');
var async = require('../util/async.js');
var alt = require('../alt.js');

class Login extends React.Component {

    constructor(props) {
        super(props);
        analytics.page(analytics.pageKeys.Login);
    }

    login = (model) => {
        AuthActions.login(model);
    }

    componentDidMount() {
        AuthStore.listen(this.onChange);
    }

    componentWillUnmount() {
        AuthStore.unlisten(this.onChange);
    }

    onChange = (state) => {
        
        this.setState(state);        
        var loginStatus = state.loginStatus;

        if (loginStatus === 'success') {

            let user = UserStore.getUser();

            analytics.identify(user._id, {
                email: user.email
            });

            async.then(() => { 
                alt.dispatcher.dispatch({action : AuthActions.CLEAR_STATUS}); 
            });

            hashHistory.replace('/');
        }
    }

    handleOk= () => {
        this.setState({
            loginStatus : null
        });
    }

    render() {

        return (
            <div className={css.root}>
                <LoginView {...this.state} login={this.login} handleOk={this.handleOk}/>
            </div>
        );
    }

}

module.exports = Login;
