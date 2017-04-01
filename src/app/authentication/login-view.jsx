var React = require('react');
var FormsyText = require('formsy-material-ui/lib/FormsyText');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var Dialog = require('material-ui/lib/dialog');
var css = require('./login.css');

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

class LoginView extends React.Component {

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

        if (this.props.loginStatus === 'loading') {
            return;
        }

        var model = this.refs.form.model;
        this.props.login(model);
    }

    render() {

        const actions = [
            <FlatButton
              label='Ok'
              onTouchTap={this.props.handleOk}
            />           
        ];

        var submitLabel = (this.props.loginStatus === 'loading') ? 'Logging In...' : 'Login';

        return (
            <div className={css.viewRoot}>

                <Formsy.Form onValid={this.enableSubmitButton} ref="form"
                    onInvalid={this.disableSubmitButton} onValidSubmit={this.submit}>

                    <FormsyText
                        name="email"
                        ref="email"
                        validations="isEmail"
                        validationError="Invalid Email"
                        required
                        hintText="Email"
                        floatingLabelText="Email"
                        underlineStyle={styles.underlineStyle}
                        underlineFocusStyle={styles.underlineFocusStyle}
                        floatingLabelStyle={styles.floatingLabelStyle}                        
                    />

                    <br/>

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
                    open={this.props.loginStatus === 'error'}
                    onRequestClose={this.props.handleOk}
                >
                    {this.props.error}
                </Dialog>
            </div>
        );
    }

}

module.exports = LoginView;
