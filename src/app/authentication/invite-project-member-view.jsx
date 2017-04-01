var React = require('react');
var FormsyText = require('formsy-material-ui/lib/FormsyText');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var Dialog = require('material-ui/lib/dialog');
var css = require('./invite-project-member.css');
var constants = require('../config/constants.js');

var styles = {
    underlineFocusStyle : {
        borderColor: '#e0e0e0'
    },
    underlineStyle : {
        borderColor : '#33691E'
    },
    floatingLabelStyle : {
        color : 'rgba(0,0,0,0.5)'
    },
    buttonStyle : {
        width : '256px',
        marginTop : '30px'
    }
};

class InviteProjectMemberView extends React.Component {

    constructor(props) {
        super(props);
        this.state= {
            canSubmit : false
        };
    }

    enableSubmitButton = () => {
        this.setState({
            canSubmit : true
        });
    }

    disableSubmitButton = () => {
        this.setState({
            canSubmit : false
        });
    }

    submit = () => {

        if (this.props.inviteProjectMemberStatus === 'loading') {
            return;
        }

        var model = this.refs.form.model;
        this.props.invite(model);
    }

    render() {

        const actions = [
            <FlatButton
              label='Ok'
              onTouchTap={this.props.handleOk}
            />           
        ];

        var submitLabel = (this.props.inviteProjectMemberStatus === 'loading') ? 'Joining...' : 'Join';

        return (
            <div className={css.viewRoot}>

            <p className={css.info}>You have been Invited to join {this.props.projectName}&nbsp; 
                on {constants.APP_NAME}. Please enter your password to join.</p>


                <Formsy.Form onValid={this.enableSubmitButton} ref="form"
                    onInvalid={this.disableSubmitButton} onValidSubmit={this.submit}>
                    
                    <FormsyText
                        name="password"
                        ref="password"
                        type="password"
                        validations="minLength:6"
                        validationError="Password should be min 6 characters"
                        required
                        hintText="Password"
                        underlineStyle={styles.underlineStyle}
                        underlineFocusStyle={styles.underlineFocusStyle}
                        floatingLabelStyle={styles.floatingLabelStyle}
                        floatingLabelText="Password"  
                        autoComplete="off"                      
                    />

                    <br/>

                    <RaisedButton
                        type="submit"
                        ref="submit"
                        label={submitLabel}
                        disabled={!this.state.canSubmit}
                        style={styles.buttonStyle}
                    />
                </Formsy.Form>

                <Dialog
                    title="Error"
                    actions={actions}
                    modal={false}
                    ref="errorDialog"
                    open={this.props.inviteProjectMemberStatus === 'error'}
                    onRequestClose={this.props.handleOk}
                >
                    {this.props.error}
                </Dialog>
            </div>
        );
    }

}

module.exports = InviteProjectMemberView;
