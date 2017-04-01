var React = require('react');
var css = require('./manage.css');
var FormsyText = require('formsy-material-ui/lib/FormsyText');
var RaisedButton = require('material-ui/lib/raised-button');
var AutoComplete = require('material-ui/lib/auto-complete');
var Chip = require('../../components/chip');
var Tabs = require('material-ui/lib/tabs/tabs');
var Tab = require('material-ui/lib/tabs/tab');
var CircularProgress = require('material-ui/lib/circular-progress');
var Dialog = require('material-ui/lib/dialog');
var FlatButton = require('material-ui/lib/flat-button');
var Formsy = require('formsy-react');

var isExisty = function (value) {
    return value !== null && value !== undefined;
};

var isEmpty = function (value) {
    return value === '';
};

var matchRegexp = function (value, regexp) {
    return !isExisty(value) || isEmpty(value) || regexp.test(value);
};

var isEmail = function (value) {
    return matchRegexp(value, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
};

class ManageView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchText : ''
        };

        Formsy.addValidationRule('isEmails', function (values, value) {

            if (!value) return;
            var emails = value.split(',');
            var valid = true;

            emails.forEach(function(email) {
                email = email.trim();
                if (!(isEmail(email))) {
                    valid = false;
                }
            });

            return valid;
        });

    }

    handleUpdateInput = (t) => { 
        this.setState({ searchText: t });
    } 

    handleSelect = (t) => {
        this.setState({ searchText: '' });
        this.props.handleSelect(t);
    }

    getClassName = (view) => {
        return (css.navItem +' '+ (this.props.selectedView === view ? css.selected : ''));
    }

    getPermissionText(permissions) {
        if (!permissions || !(permissions instanceof Array) || permissions.length === 0) {
            return 'Admin';
        }
        else {
            return 'Admin';
        }
    }

    handleOk = () => {
        this.refs.form.reset();
        this.props.handleOk();
    }

    render() {

        let progressStyle = {
            position : 'fixed',
            top : '40%',
            left : '48%'
        };

        const buttonStyle = {
            textTransform : 'capitalize'
        };

        const inviteBtnLabel = 'Invite';
        
        const actions = [
            <FlatButton
              label='Ok'
              onTouchTap={this.handleOk}
            />           
        ];

        return (
            <div className={css.root}>
                <div className={css.nav}>
                    <div data-view="manageTeam" onClick={this.props.changeView} className={this.getClassName('manageTeam')}>Manage Team Members</div>
                    <div data-view="manageAccess" onClick={this.props.changeView} className={this.getClassName('manageAccess')}>Manage Access</div>
                </div>
                <div className={css.main}>
                    <div className={css.mainContent}>
                        <div className={css.memeberList}>
                            <header>Team Members</header>
                            <div className={css.memberListTableWrap}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Account Id</th>
                                        <th>Name</th>
                                        <th>Permisssion</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {this.props.projectDetails.members.map((member) => {
                                        return (
                                            <tr key={member.id}>
                                                <td>{member.email}</td>
                                                <td>{member.email}</td>
                                                <td>
                                                   {this.getPermissionText(member.permissions)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            </div>


                        </div>

                        <div className={css.newMemberWrap}>

                            <Tabs>
                                <Tab label="Add New Members" id="int-add-new-members">
                                    <div className={css.newMemberFormWrap}>

                                        {this.props.membersToBeAdded.map((member) => {
                                            return (
                                                <Chip key={member.id} id={member.id} text={member.email} onRemoveClick={this.props.handleRemove}/>
                                            );
                                        })}

                                        <AutoComplete
                                            hintText="Account IDs of users or groups, separated by commas"
                                            dataSource={this.props.dataSource}
                                            fullWidth={true}
                                            searchText={this.state.searchText}
                                            onNewRequest={this.handleSelect}
                                            onUpdateInput={this.handleUpdateInput}
                                            id="add-new-member"
                                            autoComplete="off"
                                        />

                                        <br/>

                                        <p className={css.newMemberMeta}>An email notification with a link to the project will be sent to new team members.</p>
                                        
                                        <div className={css.submitWrap}>
                                            <RaisedButton
                                                type="submit"
                                                ref="submit"
                                                label="Add Members"
                                                disabled={!this.props.canSubmitAddMembers}
                                                onClick={this.props.addNewMembers}
                                                labelStyle={buttonStyle}
                                                id="int-add-members"
                                            />
                                        </div>

                                    </div>
                                </Tab>

                                <Tab label="Invite New Members" id="int-invite-new-members">

                                    <Formsy.Form onValid={this.props.enableInviteSubmitButton} ref="form"
                                        onInvalid={this.props.disableInviteSubmitButton} onValidSubmit={this.props.sendProjectMembersInvitation}>

                                        <FormsyText
                                            name="email"
                                            id="int-invite-member-email"
                                            ref={(node) => this._emailText = node}
                                            validations="isEmails"
                                            validationError="Invalid Email. Please write comma separated emails."
                                            required
                                            hintText="Email IDs of users, separated by commas"
                                            floatingLabelText="Email IDs"
                                            fullWidth={true}
                                        />

                                        <br/>

                                        <p className={css.newMemberMeta}>An email notification 
                                        with a link to the project will be sent to new team members.</p>
                                        
                                        <div className={css.submitWrap}>
                                            <RaisedButton
                                                type="submit"
                                                ref="submit"
                                                id="int-invite-members-button"
                                                label={inviteBtnLabel}
                                                labelStyle={buttonStyle}
                                                disabled={!this.props.canSubmitInviteMembers}
                                            />
                                        </div>
                                    </Formsy.Form>
                                </Tab>
                            </Tabs>
                            
                        </div>

                    </div>
                </div>

                {(this.props.status === 'loading') ? 
                    <div className="tp-loading-modal">
                        <CircularProgress style={progressStyle}/>
                    </div> : 
                '' } 
                
                <Dialog
                    title={this.props.status === 'error' ? 'Error' : 'Message'}
                    actions={actions}
                    modal={false}
                    ref="errorDialog"
                    open={this.props.status === 'error' || this.props.status === 'success'}
                    onRequestClose={this.handleOk}
                >
                    {this.props.error || this.props.successMessage}
                </Dialog> 
                
            </div>
        );
    }

}

module.exports = ManageView;
