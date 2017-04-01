var React = require('react');
var analytics = require('../../util/analytics.js');

var FileNavigator = require('./file-navigator.jsx');
var ThemeEditor = require('./theme-editor.jsx');
var async = require('../../util/async.js');
var ProjectSerivce = require('../project-service.js');

var Dialog = require('material-ui/lib/dialog');
var Snackbar = require('material-ui/lib/snackbar');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');

var {hashHistory,withRouter} = require('react-router');

class Theme extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fileContentStatus : 'loading',
            snackBarOpen : false,
            snackBarMessage : '',
            confirmSave : false,
            status : null,
            error : null
        };
        analytics.page(analytics.pageKeys.Project_Theme);
    }

    componentDidMount() {

        var filePath = this._getCurrentFilePath(this.props.location.pathname);
        this._showFileContent(filePath);

        this.props.setSelectedView('theme',this);
        
        this.props.router.setRouteLeaveHook(this.props.route, (nextRoute) => {
            if (this.props.saveEnabled) {
                this.setState({
                    confirmSave : true,
                    pushAfterConfirmationUrl : nextRoute.pathname
                });
                return false;
            } else {
                this.setState({
                    pushAfterConfirmationUrl : null
                });
            }
        });
    }

    _showFileContent = (filePath) => {
        
        var projectId = this.props.projectDetails.id;

        ProjectSerivce.getFileContent(projectId,filePath)
            .then((data) => {                
                this.setState({fileContent : data, fileContentStatus : 'success'});
            })
            .catch((rejection) => {
                this.setState({status : 'error',fileContentStatus : 'error', error : rejection.error.message});
            });
    }

    _getCurrentFilePath = () => {
        
        var filePath = 'assets/styles/main.css';
        
        return filePath;
    }

    onEditorChange = (value) => {

        this.setState({
            fileContent : value
        });

        this.props.enableSave(true);
    }

    disableSave = () => {
        this.props.enableSave(false);
    }

    save = () => {

        var css = this.state.fileContent;
        var projectId = this.props.projectDetails.id;
        var filePath = this._getCurrentFilePath(this.state.locationPathname);

        this.showSnackBarMessage('Saving File');

        ProjectSerivce.saveFileContent(projectId,filePath,css)
            .then(() => {
                this.hideSnackBarMessage();
                this.props.enableSave(false);
            })
            .catch((rejection) => {
                this.hideSnackBarMessage();
                this.setState({status : 'error',error : rejection.error.message});
            });
    }

    handleOk = () => {
        this.setState({
            status : null,
            error : null
        });
    }

    closeSnackBar = () => {
        
    }

    showSnackBarMessage = (message) => {
        this.setState({
            snackBarOpen : true,
            snackBarMessage : message
        });
    }

    hideSnackBarMessage = () => {
        this.setState({
            snackBarOpen : false,
            snackBarMessage : ''
        });
    }

    saveAndContinue = () => {

        var css = this.state.fileContent;
        var projectId = this.props.projectDetails.id;
        var filePath = this._getCurrentFilePath(this.state.locationPathname);

        this.showSnackBarMessage('Saving File');

        ProjectSerivce.saveFileContent(projectId,filePath,css)
            .then(() => {
                this.hideSnackBarMessage();
                this.setState({confirmSave : false});
                this.props.enableSave(false);
                async.then(() => {
                    hashHistory.push(this.state.pushAfterConfirmationUrl);
                });
            })
            .catch((rejection) => {
                this.hideSnackBarMessage();
                this.setState({status : 'error',error : rejection.error.message});
            });
    }

    discardChanges = () => {
        this.setState({confirmSave : false});
        this.props.enableSave(false);  
        async.then(() => {
            hashHistory.push(this.state.pushAfterConfirmationUrl);
        });
    }

    closeConfirmationDialog = () => {
        this.setState({confirmSave : false });
    }

    render() {

        const styles = {
            display : 'flex',
            flexGrow : '1'
        };

        const errorDialogActions = [
            <FlatButton
              label='Ok'
              onTouchTap={this.handleOk}
            />           
        ];

        const confirmDialogActions = [
            <FlatButton
              label='Cancel'
              onTouchTap={this.closeConfirmationDialog}
            />,  
            <FlatButton
              label='Discard Changes'
              onTouchTap={this.discardChanges}
            />,        
            <RaisedButton
                label='Save and Continue'
                secondary={true}
                onTouchTap={this.saveAndContinue}
            />     
        ];

        return (
            <section style={styles}>
                <FileNavigator projectDetails={this.props.projectDetails}  {...this.state} />
                <ThemeEditor {...this.state} 
                    disableSave={this.disableSave}
                    onEditorChange={this.onEditorChange}
                    />

                <Dialog
                    title={'Error'}
                    actions={errorDialogActions}
                    modal={false}
                    ref="errorDialog"
                    open={this.state.status === 'error'}
                    onRequestClose={this.handleOk}
                >
                    {this.state.error}
                </Dialog>
                <Snackbar
                    open={this.state.snackBarOpen}
                    message={this.state.snackBarMessage}
                    onRequestClose={this.closeSnackBar}
                />

                <Dialog
                    title={'Before You Continue'}
                    actions={confirmDialogActions}
                    modal={true}
                    ref="confirmDialog"
                    open={this.state.confirmSave}
                >
                   <p> Would you like to save your changes before leaving this page? </p>
                </Dialog> 

            </section>
        );
    }

}

module.exports = withRouter(Theme);
