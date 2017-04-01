var React = require('react');
var OrgSignupView = require('./org-signup-view');
var AuthStore = require('./auth-store');
var AuthActions = require('./auth-actions');
var {hashHistory} = require('react-router');
var css = require('./org-signup.css');
var analytics = require('../util/analytics.js');
var async = require('../util/async.js');
var alt = require('../alt.js');

class OrgSignup extends React.Component {

    constructor(props) {
        super(props);
        analytics.page(analytics.pageKeys.Org_SignUp);
    }

    register = (model) => {
        AuthActions.register(model);
    }

    componentDidMount() {
        AuthStore.listen(this.onChange);
    }

    componentWillUnmount() {
        AuthStore.unlisten(this.onChange);
    }

    onChange = (state) => {

        this.setState(state);        
        var regStatus = state.regStatus;

        if (regStatus === 'success') {
            async.then(() => { 
                alt.dispatcher.dispatch({action : AuthActions.CLEAR_STATUS}); 
            });
            hashHistory.replace('/login');
        }
    }

    handleOk= () => {
        this.setState({
            regStatus : null
        });
    }

    render() {

        return (
            <div className={css.root}>
                <OrgSignupView {...this.state} register={this.register} handleOk={this.handleOk}/>
            </div>
        );
    }

}

module.exports = OrgSignup;
