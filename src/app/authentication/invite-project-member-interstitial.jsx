var React = require('react');
var AuthStore = require('./auth-store');
var AuthActions = require('./auth-actions');
var {hashHistory} = require('react-router');
var analytics = require('../util/analytics.js');
var async = require('../util/async.js');
var alt = require('../alt.js');
var FlatButton = require('material-ui/lib/flat-button');
var RaisedButton = require('material-ui/lib/raised-button');
var Dialog = require('material-ui/lib/dialog');
var constants = require('../config/constants.js');

var rootStyle = {
    background: 'rgb(242,242,246)',
    height: '100%',
    padding: '30px 30px',
    boxSizing : 'border-box'
};

class InviteProjectMemberInterstitial extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inviteProjectMemberStatus : null
        };
        this.projectName = this.props.location.query.name;
        this.id = this.props.params.id;
        analytics.page(analytics.pageKeys.Invite_Project_Member_Interstitial);
    }

    componentDidMount() {
        AuthStore.listen(this.onChange);
    }

    componentWillUnmount() {
        AuthStore.unlisten(this.onChange);
    }

    onChange = (state) => {
        
        this.setState(state);        
        var inviteProjectMemberStatus = state.inviteProjectMemberStatus;

        if (inviteProjectMemberStatus === 'success') {

            async.then(() => { 
                alt.dispatcher.dispatch({action : AuthActions.CLEAR_STATUS}); 
            });

            hashHistory.replace('/login');
        }
    }

    handleOk= () => {
        alt.dispatcher.dispatch({action : AuthActions.CLEAR_STATUS}); 
    }

    join = () => {
        AuthActions.inviteProjectMember(this.id);
    }

    render() {

        const actions = [
            <FlatButton
              label='Ok'
              onTouchTap={this.handleOk}
            />           
        ];

        var joinLabel = (this.state.inviteProjectMemberStatus === 'loading') ? 'Joining...' : 'Join';

        return (
            <div style={rootStyle}>
                <p> You have been invited to join {this.projectName} on {constants.APP_NAME}</p>
                <p> Click the button to Join </p> 

                <RaisedButton
                    ref="join"
                    label={joinLabel}
                    primary={true}
                    onClick={this.join}
                    disabledBackgroundColor="#ff4081"
                    disabledLabelColor="white"
                    disabled={this.state.inviteProjectMemberStatus === 'loading'}
                />

                <Dialog
                    title="Error"
                    actions={actions}
                    modal={false}
                    ref="errorDialog"
                    open={this.state.inviteProjectMemberStatus === 'error'}
                    onRequestClose={this.handleOk}
                >
                    {this.state.error}
                </Dialog>

            </div>
        );

    }

}

module.exports = InviteProjectMemberInterstitial;
