var React = require('react');
var InviteProjectMemberView = require('./invite-project-member-view.jsx');
var AuthStore = require('./auth-store');
var AuthActions = require('./auth-actions');
var {hashHistory} = require('react-router');
var css = require('./login.css');
var analytics = require('../util/analytics.js');
var async = require('../util/async.js');
var alt = require('../alt.js');

class InviteProjectMember extends React.Component {

    constructor(props) {
        super(props);
        analytics.page(analytics.pageKeys.Invite_Project_Member);
        this.projectName = this.props.location.query.name;
    }

    invite = (model) => {
        var id = this.props.params.id;
        AuthActions.inviteProjectMember(id,model);
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
        this.setState({
            inviteProjectMemberStatus : null
        });

        async.then(() => { 
            alt.dispatcher.dispatch({action : AuthActions.CLEAR_STATUS}); 
        });
    }

    render() {

        return (
            <div className={css.root}>
                <InviteProjectMemberView {...this.state}
                    invite={this.invite} handleOk={this.handleOk} projectName={this.projectName}/>
            </div>
        );
    }

}

module.exports = InviteProjectMember;
