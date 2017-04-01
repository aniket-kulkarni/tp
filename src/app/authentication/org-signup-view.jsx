var React = require('react');
var FormsyText = require('formsy-material-ui/lib/FormsyText');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var Dialog = require('material-ui/lib/dialog');
var css = require('./org-signup.css');

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

class OrgSignupView extends React.Component {

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

        if ((this.props.regStatus === 'loading')) {
            return;
        }
        
        var model = this.refs.form.model;
        this.props.register(model);
    }

    render() {

        const actions = [
            <FlatButton
              label='Ok'
              onTouchTap={this.props.handleOk}
            />           
        ];

        var submitLabel = (this.props.regStatus === 'loading') ? 'Signing Up...' : 'Sign Up';

        return (
            <div className={css.viewRoot}>

                <Formsy.Form onValid={this.enableSubmitButton} ref="form"
                    onInvalid={this.disableSubmitButton} onValidSubmit={this.submit.bind(this)}>

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
                        name="org"
                        ref="org"
                        validations={{isWords : true , minLength : 3}}
                        validationErrors={{isWords : 'Should contains alphabets',
                                            minLength : 'Should be atleast 3 characters'
                                    }}
                        required
                        hintText="Organization"
                        floatingLabelText="Organization"
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

                    <FormsyText
                        name="confirmPassword"
                        ref="confirmPassword"
                        type="password"
                        validations="equalsField:password"
                        validationError="Should be same as Password"
                        required
                        hintText="Confirm Password"
                        floatingLabelText="Confirm Password"
                        underlineStyle={styles.underlineStyle}
                        underlineFocusStyle={styles.underlineFocusStyle}
                        floatingLabelStyle={styles.floatingLabelStyle}                        
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
                    open={this.props.regStatus === 'error'}
                    onRequestClose={this.props.handleOk}
                >
                    {this.props.error}
                </Dialog>
            </div>
        );
    }

}

module.exports = OrgSignupView;
