var React = require('react');
var analytics = require('../../util/analytics.js');
var css = require('./export.css');

var ProjectService = require('../project-service.js');
var constants = require('../../config/constants.js');
var config = require('../../config/config.js');

var CircularProgress = require('material-ui/lib/circular-progress');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var Dialog = require('material-ui/lib/dialog');
var Snackbar = require('material-ui/lib/snackbar');
var RadioButton = require('material-ui/lib/radio-button');
var RadioButtonGroup = require('material-ui/lib/radio-button-group');

var moment = require('moment');

class Export extends React.Component {

    constructor(props) {
        super(props);
        this.getExportData();
        this.state = {
            dataLoaded : false,
            recentEpubExports : [],
            recentWebExports : [],
            buildInProgress : false,
            snackBarOpen : false,
            snackBarMessage : '',
            showErrorDialog : false,
            showWebExportAuthDialog : false,
            showPin : false,
            pin : '',
            pinError : false
        };
        analytics.page(analytics.pageKeys.Project_Export);
    }

    componentDidMount() {
        this.props.setSelectedView('export');
    }

    exportToEpub = () => {

        if (this.state.buildInProgress) {
            this.setState({snackBarOpen : true, snackBarMessage : 'Build In Progress'});
        } else {

            var exportItem = {
                status : 'pending',
                _id : 'temp'
            };
            
            var recentEpubExports = this.state.recentEpubExports;
            recentEpubExports.unshift(exportItem);
            this.setState({recentEpubExports, buildInProgress : true});

            ProjectService.exportProject(this.props.projectDetails.id)
                .then((data) => {

                    var recentEpubExports = data.epubs.filter((build,index,arr) => {
                        
                        if (index >= (arr.length-3)) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    recentEpubExports.reverse();

                    this.setState({recentEpubExports,buildInProgress : false});
                })
                .catch(() => {
                    var recentEpubExports = this.state.recentEpubExports;
                    recentEpubExports[0].status = 'failed';
                    this.setState({recentEpubExports,buildInProgress : false});
                });
        }

    }

    confirmWebExportAuth = () => {

        if (this.state.buildInProgress) {
            this.setState({snackBarOpen : true, snackBarMessage : 'Build In Progress'});
        } else {
            this.setState({
                showWebExportAuthDialog : true
            });
        }
    }

    closeWebExportAuthDialog = () => {
        this.setState({
            showWebExportAuthDialog : false,
            pin : ''
        });
    }

    exportToWeb = () => {

        if (this.state.showPin) {
            let pin = this.state.pin;    
            if (pin.length !== 4 && pin.trim().length !== 4) {
                this.setState({pinError : true});
                return;
            }
        }

        if (this.state.buildInProgress) {
            this.setState({snackBarOpen : true, snackBarMessage : 'Build In Progress'});
        } else {

            var exportItem = {
                status : 'pending',
                _id : 'temp'
            };
            
            var recentWebExports = this.state.recentWebExports;
            recentWebExports.unshift(exportItem);
            
            var data = {};

            if (this.state.showPin) {
                data.pin = this.state.pin;    
            }

            this.setState({recentWebExports, buildInProgress : true, showWebExportAuthDialog : false, pin : ''});
            ProjectService.exportWebProject(this.props.projectDetails.id,data)
                .then((data) => {

                    var recentWebExports = data.web.filter((build,index,arr) => {
                        
                        if (index >= (arr.length-3)) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    recentWebExports.reverse();

                    this.setState({recentWebExports,buildInProgress : false});
                })
                .catch(() => {
                    var recentWebExports = this.state.recentWebExports;
                    recentWebExports[0].status = 'failed';
                    this.setState({recentWebExports,buildInProgress : false});
                });
        }

    }

    getExportData() {
        ProjectService.getExportData(this.props.projectDetails.id)
            .then((data) => {
                
                data.epubs = data.epubs || [];
                data.web = data.web || [];

                var recentEpubExports = data.epubs.filter((build,index,arr) => {
                    
                    if (index >= (arr.length-3)) {
                        build.index = (index + 1);
                        return true;
                    } else {
                        return false;
                    }
                });

                var recentWebExports = data.web.filter((build,index,arr) => {
                    
                    if (index >= (arr.length-3)) {
                        build.index = (index + 1);
                        return true;
                    } else {
                        return false;
                    }
                });

                recentWebExports.reverse();

                this.setState({dataLoaded : true,recentEpubExports,recentWebExports});
            })
            .catch((rejection) => {
                this.setState({dataLoaded : true,showErrorDialog : true, errorMessage : rejection.error.message});
            });
    }

    closeSnackBar = () => {
        this.setState({
            snackBarOpen : false,
            snackBarMessage : ''
        });
    }

    handleOk= () => {
        this.setState({
            showErrorDialog : false
        });
    }

    toggleWebBuildPin = (e,val) => {
        var showPin = (val === 'with_pin') ? true : false;
        this.setState({showPin});
    }

    updatePin = (e) => {        
        this.setState({pin : e.target.value,pinError : false});
    }

    render() {
        
        if (!(this.state.dataLoaded)) {

            let progressStyle = {
                position : 'absolute',
                top : '40%',
                left : '40%'
            };

            return (
                <CircularProgress style={progressStyle}/>
            );
        } else {

            const errorActions = [
                <FlatButton
                  label='Ok'
                  onTouchTap={this.handleOk}
                />           
            ];

            const webExportAuthActions = [
                <FlatButton
                  label='Build'
                  onTouchTap={this.exportToWeb}
                /> ,
                <FlatButton
                  label='Cancel'
                  onTouchTap={this.closeWebExportAuthDialog}
                />           
            ];

            const dialogStyles = {
                overlayStyle : {
                    background : 'linear-gradient(to left, #3CA55C , #B5AC49)',
                    transition : null
                },
                style : {
                    transition : null
                },                        
                overlayClassName  : 'web-export-auth-build-overlay'
            };

            return (
                <div className={css.root}>
                    <div className={css.meta}>

                        <div className={css.title}> {this.props.projectDetails.name} </div>
                        <div className={css.cover}> <img src={this.props.projectDetails.coverUrl} /> </div>
                    </div>

                    <div className={css.main}>

                        <div className={css.buildsContainer}>
                            <div className={css.exportsContainer}>
                                <div className={css.heading}>
                                    <div className={css.buildTitle}> Export </div>
                                    <div className={css.buildActions}> 
                                        <RaisedButton label="Export" onClick={this.exportToEpub}/>
                                    </div>
                                </div>

                                <div className={css.exportList}>

                                    {!(this.state.recentEpubExports.length) ?
                                        <div className={css.noExports}>
                                            There have been no exports yet.
                                        </div> :

                                            <table className={css['exportTable']}>
                                                <tbody>

                                        {this.state.recentEpubExports.map((exportItem) => {

                                            if (exportItem.status === 'pending') {
                                                return (
                                                    <tr key={exportItem._id} className={css['export-pending']}>
                                                        <td className={css.buildItemName}>Export</td>
                                                        <td className={css.buildItemStatus}>
                                                            Pending...
                                                        </td>
                                                        <td className={css.buildItemActions}>
                                                            
                                                        </td>
                                                    </tr>    
                                                );
                                            } else {
                                                return (
                                                    <tr key={exportItem._id} className={css['export-' + exportItem.status]}>
                                                        <td className={css.buildItemName}>Export {exportItem.index}</td>
                                                        <td className={css.buildItemStatus}>
                                                            <div>
                                                                <div>
                                                                    <span className={css.buildItemDate}> 
                                                                        {moment(exportItem.createdOn).format('ll')}
                                                                    </span>
                                                                    <span className={css.buildItemTime}> 
                                                                        &nbsp;{moment(exportItem.createdOn).format('LT')}
                                                                    </span>
                                                                </div>
                                                                <div className={css.buildItemRevision}>
                                                                    Revision {exportItem.revision}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={css.buildItemActions}>
                                                            {
                                                                (exportItem.status === 'success') ?
                                                                    <a className={css.downloadLink} download={exportItem.downloadLink} 
                                                                        href={config.apiServerUrl + constants.DOWNLOAD_EPUB_BASE + exportItem._id + '/epub/download'}> 
                                                                        Download
                                                                    </a> :
                                                                    <p> Failed </p>
                                                            }
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            
                                        })}

                                        </tbody>
                                        </table>
                                    }

                                </div>

                            </div>

                            <div className={css.exportsContainer}>
                                <div className={css.heading}>
                                    <div className={css.buildTitle}> Web Builds </div>
                                    <div className={css.buildActions}> 
                                        <RaisedButton label="Build to Web" onClick={this.confirmWebExportAuth}/>
                                    </div>
                                </div>

                                <div className={css.exportList}>

                                    {!(this.state.recentWebExports.length) ?
                                        <div className={css.noExports}>
                                            There have been no exports yet.
                                        </div> :

                                            <table className={css['exportTable']}>
                                                <tbody>

                                        {this.state.recentWebExports.map((exportItem) => {

                                            if (exportItem.status === 'pending') {
                                                return (
                                                    <tr key={exportItem._id} className={css['export-pending']}>
                                                        <td className={css.buildItemName}>Export</td>
                                                        <td className={css.buildItemStatus}>
                                                            Pending...
                                                        </td>
                                                        <td className={css.buildItemActions}>
                                                            
                                                        </td>
                                                    </tr>    
                                                );
                                            } else {
                                                return (
                                                    <tr key={exportItem._id} className={css['export-' + exportItem.status]}>
                                                        <td className={css.buildItemName}>Draft {exportItem.index}</td>
                                                        <td className={css.buildItemStatus}>
                                                            <div>
                                                                <div>
                                                                    <span className={css.buildItemDate}> 
                                                                        {moment(exportItem.createdOn).format('ll')}
                                                                    </span>
                                                                    <span className={css.buildItemTime}> 
                                                                        &nbsp;{moment(exportItem.createdOn).format('LT')}
                                                                    </span>
                                                                </div>
                                                                <div className={css.buildItemRevision}>
                                                                    Revision {exportItem.revision}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={css.buildItemActions}>
                                                            {
                                                                (exportItem.status === 'failed') ?
                                                                    <p> Failed </p> :
                                                                    <a className={css.downloadLink} data-id={exportItem._id}
                                                                        href={'#/read/' + exportItem._id} target="_blank"> 
                                                                        View
                                                                    </a>
                                                            }
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            
                                        })}

                                        </tbody>
                                        </table>
                                    }

                                </div>

                            </div>
                            
                        </div>
                    </div>

                    <Snackbar
                        open={this.state.snackBarOpen}
                        message={this.state.snackBarMessage}
                        onRequestClose={this.closeSnackBar}
                        autoHideDuration={1500}
                    />


                    <Dialog
                        title="Error"
                        actions={errorActions}
                        modal={false}
                        ref="errorDialog"
                        open={this.state.showErrorDialog}
                        onRequestClose={this.handleOk}
                    >
                        {this.state.errorMessage}
                    </Dialog>

                    <Dialog
                            title="Build To Web"
                            actions={webExportAuthActions}
                            modal={false}
                            ref="webExportAuthDialog"
                            open={this.state.showWebExportAuthDialog}
                            onRequestClose={this.closeWebExportAuthDialog}
                            {...dialogStyles}
                        >
                            <div>
                                <RadioButtonGroup name="buildType" defaultSelected="without_pin" onChange={this.toggleWebBuildPin}>
                                     <RadioButton
                                       value="without_pin"
                                       label="Access to Everyone"
                                       style={{marginBottom : 16}}
                                     />
                                     <RadioButton
                                       value="with_pin"
                                       label="Access with Pin"
                                       style={{marginBottom : 16}}
                                     />
                                </RadioButtonGroup>

                                {this.state.showPin && 
                                    <div>
                                        Enter your pin
                                        <input type="password" maxLength="4" onChange={this.updatePin}
                                            className={css.pin} value={this.state.pin}/>
                                        {this.state.pinError && <span className={css.pinError}>
                                            Pin should be of four characters </span>
                                        }                                        
                                    </div>
                                }
                            </div>
                    </Dialog>

                </div>

            );
        }

        
    }

}

module.exports = Export;
