var React = require('react');
var analytics = require('../../util/analytics');

var TableOfContents = require('./table-of-contents.jsx');
var ContentEditor = require('./content-editor.jsx');
var CodeEditor = require('./code-editor.jsx');
var Patterns = require('./patterns.jsx');
var Comments = require('./comments.jsx');
var {statusText} = require('./issueConfig.js');

var Dialog = require('material-ui/lib/dialog');
var Snackbar = require('material-ui/lib/snackbar');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');

var alt = require('../../alt.js');
var async = require('../../util/async.js');
var ProjectActions = require('../project-actions.js');
var ProjectSerivce = require('../project-service.js');
var UserStore = require('../../authentication/user-store.js');

var {hashHistory,withRouter} = require('react-router');

class Content extends React.Component {

    constructor(props) {
        super(props);
        analytics.page(analytics.pageKeys.Project_Content);
        
        var filePath = this._getCurrentFilePath(this.props.location.pathname);

        var author = {
            id : UserStore.getUserId(),
            email : UserStore.getUserEmail()
        };

        var {issuesCountByChapter,issuesCountByFile,issuesByFile} = this.getIssuesByFile(this.props.issues);
        var currentIssue = issuesByFile[filePath];
        var currentIssueClone = currentIssue ? JSON.parse(JSON.stringify(currentIssue)) : [];


        this.state = {
            dragFlag : false,
            status : null,
            savedFileContent : null,
            fileContent : null,
            fileContentStatus : 'loading',
            fileContentError : null,
            fileContentChangeOrigin : null,
            filePath,
            snackBarOpen : false,
            snackBarMessage : '',
            confirmSave : false,
            locationPathname : this.props.location.pathname,
            editorHidden : false,
            editMode : true,
            issues : currentIssueClone,
            deviceWidthValue: 2,
            author : author,
            hideStatus : {},
            hideAssignees : {},
            saveIssues : false,
            saveContent : false,
            issuesCountByChapter,
            issuesCountByFile,
            secured : {
                issuesByFile : issuesByFile       
            }
        };

        this._showFileContent(filePath);
    }

    componentDidMount() {        
        this.props.setSelectedView('content',this);
        this.setLeaveHook();
    }

    setLeaveHook() {
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

    componentWillReceiveProps(nextProps) {

        var newPath = nextProps.location.pathname,
            currentPath = this.props.location.pathname;

        if (newPath !== currentPath) {

            let filePath = this._getCurrentFilePath(nextProps.location.pathname);
            
            let {issuesByFile} = this.getIssuesByFile(nextProps.issues);
            let currentIssue = issuesByFile[filePath];
            let currentIssueClone = currentIssue ? JSON.parse(JSON.stringify(currentIssue)) : [];

            this.setState({ 
                fileContentStatus : 'loading',filePath,
                locationPathname : nextProps.location.pathname,
                issues : currentIssueClone
            });

            this._showFileContent(filePath);
        }
        else if (this.props.issues !== nextProps.issues) {

            let filePath = this.state.filePath;

            let {issuesCountByChapter,issuesCountByFile,issuesByFile} = this.getIssuesByFile(nextProps.issues);
            let currentIssue = issuesByFile[filePath];
            let currentIssueClone = currentIssue ? JSON.parse(JSON.stringify(currentIssue)) : [];

            this.setState({ 
                issues : currentIssueClone,issuesCountByChapter,issuesCountByFile,
                secured : {
                    issuesByFile : issuesByFile
                }
            });
        }
    }

    getIssuesByFile(issues) {

        var issuesCountByChapter = {},
            issuesCountByFile = {},
            issuesByFile = {};

        issues.forEach((issue) => {
            
            var filePath = issue.filePath;
            var chapter = filePath.split('/')[0];
            var status = issue.status;

            if (issuesCountByChapter[chapter]) {
                issuesCountByChapter[chapter][status] = (issuesCountByChapter[chapter][status]) ? (issuesCountByChapter[chapter][status] + 1) : 1;
            } else {
                issuesCountByChapter[chapter] = {};
                issuesCountByChapter[chapter][status] = 1;
            }

            if (issuesCountByFile[filePath]) {
                issuesCountByFile[filePath][status] = (issuesCountByFile[filePath][status]) ? (issuesCountByFile[filePath][status] + 1) : 1;
            } else {
                issuesCountByFile[filePath] = {};
                issuesCountByFile[filePath][status] = 1;
            }

            if (!(issuesByFile[filePath])) {
                issuesByFile[filePath] = [];
            } 

            issuesByFile[filePath].push(issue);
            
            
        });

        return {
            issuesCountByChapter,issuesCountByFile,issuesByFile
        };
    }

    hideEditor = () => {

        this.editorWidth = $('#editor-wrap').width();
    
        $('#editor-wrap').animate({
            width : 0
        },250, function() {
            $(this).addClass('hide');
        });

        this.setState({editorHidden : true});
    }

    showEditor = () => {

        var $editor = $('#editor-wrap');

        $editor.removeClass('hide');

        $editor.animate({
            width : this.editorWidth
        },250);

        this.setState({editorHidden : false});   
    }

    onModeChange = (e,mode) => {
        this.setState({
            editMode : !mode
        });
    }

    updateProjectStructure = (data) => {
        alt.dispatcher.dispatch({action : ProjectActions.UPDATE_PROJECT_STRUCTURE,data});
    }

    _getCurrentFilePath = (pathname) => {
        
        var projectId = this.props.projectDetails.id;
        var filePath;

        if (pathname.includes(`${projectId}/file/`)) {

            let t = pathname.split(`${projectId}/file/`);
            filePath = t[1];

            if (filePath[filePath.length - 1] === '/') {
                filePath = filePath.slice(0,filePath.length-1);
            }
        } else {
            var structure = this.props.projectDetails.structure;
            var firstChapter = structure.children[0].name;
            var firstFile = structure.children[0].files[0].name;
            filePath = firstChapter + '/' + firstFile;
        }

        return filePath;
    }

    _showFileContent = (filePath) => {
        
        var projectId = this.props.projectDetails.id;

        ProjectSerivce.getFileContent(projectId,filePath)
            .then((data) => {
                this.setState({savedFileContent : data, fileContent : data, fileContentStatus : 'success'});
            })
            .catch((rejection) => {
                this.setState({status : 'error',fileContentStatus : 'error', error : rejection.error.message});
            });
    }

    isNewIssue(issue) {
        var isNew = (issue._id) ? false : true;
        return isNew;
    }

    getSaveIssueReq() {
        var issues = this.state.issues;
        var newIssues = [], updateIssues = [];

        issues.forEach((issue) => {
            if (this.isNewIssue(issue)) {
                newIssues.push(issue);
            } else {
                if (issue.edited) {
                    updateIssues.push(issue);
                }
            }
        });
        
        return {
            new : newIssues,update:updateIssues
        };
    }

    updateIssuesInStore(issues) {
        alt.dispatcher.dispatch({action : ProjectActions.UPDATE_ISSUES, data : issues});
    }

    saveHtml = () => {
        var htmlStr = this.getSaveData();
        var projectId = this.props.projectDetails.id;
        var filePath = this._getCurrentFilePath(this.state.locationPathname);
        return ProjectSerivce.saveFileContent(projectId,filePath,htmlStr);
    }

    saveIssues = () => {
        var req = this.getSaveIssueReq();
        var projectId = this.props.projectDetails.id;
        return ProjectSerivce.saveIssues(projectId,req);
    }

    save = (routeNext) => {
        
        var promises = [];

        if (this.state.saveContent) { promises.push(this.saveHtml());} 
        if (this.state.saveIssues) { promises.push(this.saveIssues());}
        if (promises.length === 0) { throw new Error('Promises cant be of length zero in content save method');}
        
        this.showSnackBarMessage('Saving');

        Promise.all(promises)
            .then((responses) => {
                var htmlStr,newIssues;

                if (responses.length === 2) {
                    [htmlStr,newIssues] = responses;
                } else {
                    var {saveContent,saveIssues} = this.state;
                    htmlStr = saveContent ? responses[0] : null;
                    newIssues = saveIssues ? responses[0] : null;
                } 

                if (htmlStr) {
                    this.setState({savedFileContent : htmlStr});
                }

                if (newIssues) {
                    this.updateIssuesInStore(newIssues);
                }
            })
            .then(() => {
                this.hideSnackBarMessage();
                this.props.enableSave(false);
                this.setState({
                    saveIssues : false,saveContent : false, confirmSave : false
                });
            })
            .then(() => {
                if (routeNext) {
                    async.then(() => {
                        hashHistory.push(this.state.pushAfterConfirmationUrl);
                    });
                }
            })
            .catch((rejection) => {
                this.setState({status : 'error',error : rejection.error.message});
            });
    }

    saveAndContinue = () => {
        this.save(true);
    }

    getSaveData = () => {
        var parser = new DOMParser();
        var savedDoc = parser.parseFromString(this.state.savedFileContent, 'text/html');
        var currentDoc = parser.parseFromString(this.state.fileContent, 'text/html');

        savedDoc.body.innerHTML = currentDoc.body.innerHTML;

        var html = savedDoc.documentElement.outerHTML,
            doctype = new XMLSerializer().serializeToString(savedDoc.doctype),
            htmlStr = doctype + '\n' + html;

        return htmlStr;
    }

    onFileChange = (file) => {
        var projectId = this.props.projectDetails.id;
        hashHistory.push(`/project/${projectId}/file/${file}`);
    }

    onCodeEditorChange = (value) => {
        this.setState({
            fileContent : value,
            fileContentChangeOrigin : 'codeEditorChange'
        });

        this.enableContentSave();
    }

    onContentEditorChange = (value) => {
        this.setState({
            fileContent : value,
            fileContentChangeOrigin : 'contentEditorChange'
        });

        this.enableContentSave();
    }

    onError = (err) => {
        this.setState({
            status : 'error',
            error : err
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

    changeDeviceWidth = (width) => {
        this.setState({deviceWidthValue: width});
    }

    setDragFlag = (value) => {
        this.setState({
            dragFlag : !!value
        });
    }

    addNewIssue = (issue) => {
        
        var issues = this.state.issues;
        issues.push(issue);
        this.setState({issues});
    }

    toggleIssueVisibilty = (issueIndex) => {

        var issue = this.state.issues[issueIndex];

        if (!(issue.edit)) {
            issue.minimized = !(issue.minimized);
            this.setState({
                issues : this.state.issues
            });
        }
    }

    minimizeIssue = (issueIndex) => {

        var issue = this.state.issues[issueIndex];

        if (!(issue.edit)) {
            issue.minimized = true;
            this.setState({
                issues : this.state.issues
            });
        }
    }

    enableIssueCommentEditing = (issueIndex,commentIndex) => {
        var issues = this.state.issues;
        var comment = issues[issueIndex].comments[commentIndex];
        comment.edit = true;
        this.setState({issues});
    }

    enableContentSave() {
        this.setState({saveContent : true});
        this.props.enableSave(true);
    }

    enableIssueSave(issue) {

        if (!this.isNewIssue(issue)) {
            issue.edited = true;
        }

        this.props.enableSave(true);
        this.setState({saveIssues : true});
    }

    reply = (issueIndex) => {
        var {issues,author} = this.state;

        if (issues[issueIndex].new) {
            return;
        }

        var currentIssue = issues[issueIndex];

        var comments = currentIssue.comments;
        var lastComment = comments[comments.length - 1];

        if (!(lastComment.new)) {
            var newComment = {
                author : author.id,
                text : '',
                type : 'comment',
                edit : true,
                new : true
            };

            comments.push(newComment);
        } else {
            lastComment.edit = true;
        }
        this.setState({issues});

    }

    updateComment = (issueIndex,commentIndex,val) => {

        var issues = this.state.issues;
        var issue = issues[issueIndex];
        var comment = issue.comments[commentIndex];

        if (val) {
            comment.text = val;
            comment.edited = true;
            this.enableIssueSave(issue);
        } else {
            if (!(comment.done)) {
                issues[issueIndex].comments.splice(commentIndex,1);
            }
        }

        comment.edit = false;
        comment.done = true;
        issues[issueIndex].edit = false;

        if (issues[issueIndex].comments.length === 0) {
            issues.splice(issueIndex,1);
        }

        this.setState({issues});
    }

    _updateMetadata(issue,issueIndex,newStatus,newAssignee) {

        var newIssue = this.isNewIssue(issue);

        if (newIssue) {
            return;
        }
        
        var savedIssues = this.state.secured.issuesByFile[this.state.filePath];
        var savedIssue = savedIssues[issueIndex];

        var lastSavedAssignee = savedIssue? savedIssue.assignee : null,
            lastSavedStatus = savedIssue? savedIssue.status : null;

        var comments = issue.comments;
        var lastComment = comments[comments.length - 1];

        if (newAssignee === lastSavedAssignee && newStatus === lastSavedStatus) {
            delete lastComment.metaStatus;
            delete lastComment.metaAssignee;

            if (!(lastComment.text && lastComment.text.trim())) {
                issue.comments.splice(comments.length - 1,1);
            }
            return;
        }

        let metaStatus,metaAssignee;
        let members = this.props.projectDetails.members;

        if (newStatus !== lastSavedStatus) {
            metaStatus = `Status -> ${statusText[newStatus]}`;
        }

        if (newAssignee !== lastSavedAssignee) {
            let newAssigneeMember = (members.filter((member) => {
                if ( newAssignee === member.id ) {
                    return member;
                }
            }))[0];
            
            metaAssignee = ` Assignee -> ${newAssigneeMember.email}`;
        }

        if (!(lastComment.new)) {
            comments.push({
                author : this.state.author,
                text : '',
                metaStatus,metaAssignee,
                new : true
            });
        } else {
            lastComment.metaAssignee = metaAssignee;
            lastComment.metaStatus = metaStatus;
        }
    }

    updateIssuePosition = (issueIndex,newLeft,newTop) => {
        var issues = this.state.issues;
        var issue = issues[issueIndex];
        
        issue.position.left = newLeft;
        issue.position.top = newTop;
        
        this.enableIssueSave(issue);
        this.setState({issues});
    }

    changeStatus = (issueIndex,val) => {
        var issues = this.state.issues;
        var issue = issues[issueIndex];

        this._updateMetadata(issue,issueIndex,val,issue.assignee);
        issues[issueIndex].status = val;

        this.enableIssueSave(issue);
        this.setState({issues});
    }

    changeAssignee = (issueIndex,val) => {

        var issues = this.state.issues;
        var issue = issues[issueIndex];

        this._updateMetadata(issue,issueIndex,issue.status,val);
        issue.assignee = val;
        
        this.enableIssueSave(issue);
        this.setState({issues});
    }

    toggleIssueStatus = (status) => {
        var {hideStatus,hideAssignees,issues} = this.state;
        var currentStatus= hideStatus[status];

        if (currentStatus) {
            hideStatus[status] = !currentStatus;
        } else {
            hideStatus[status] = true;
        }

        issues.forEach((issue) => {
            var issueStatus = issue.status;
            var issueAssignee = issue.assignee ? issue.assignee : 'unassigned';
            issue.minimized = hideStatus[issueStatus] || hideAssignees[issueAssignee];
        });

        this.setState({hideStatus,issues});
    }

    toggleIssueAssignees = (assignee) => {
        var {hideStatus,hideAssignees,issues} = this.state;
        var currentAssignee= hideAssignees[assignee];

        if (currentAssignee) {
            hideAssignees[assignee] = !currentAssignee;
        } else {
            hideAssignees[assignee] = true;
        }

        issues.forEach((issue) => {
            var issueStatus = issue.status;
            var issueAssignee = issue.assignee ? issue.assignee : 'unassigned';
            issue.minimized = hideStatus[issueStatus] || hideAssignees[issueAssignee];
        });

        this.setState({hideAssignees,issues});
    }

    render() {
    
        const styles = {
            display : 'flex',
            'flexGrow' : 1
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

        var rootClass = this.state.editMode ? 'editMode' : 'reviewMode';

        var savedIssues = this.state.secured.issuesByFile[this.state.filePath] || [];

        var {issues,author,filePath,deviceWidthValue,hideStatus,hideAssignees} = this.state;
        var commentProps = {issues,author,filePath,deviceWidthValue,hideStatus,hideAssignees};

        return (
            <div id="content-root" style={styles} className={rootClass}>

                <TableOfContents projectDetails={this.props.projectDetails} onFileChange={this.onFileChange}
                    updateProjectStructure={this.updateProjectStructure} onError={this.onError}
                    showSnackBarMessage={this.showSnackBarMessage} hideSnackBarMessage={this.hideSnackBarMessage}
                    {...this.state} />
                

                <ContentEditor {...this.state} projectDetails={this.props.projectDetails} 
                    onContentEditorChange={this.onContentEditorChange} showEditor={this.showEditor} 
                    onModeChange={this.onModeChange} updateComment={this.updateComment} 
                    toggleIssueVisibilty={this.toggleIssueVisibilty} minimizeIssue={this.minimizeIssue} 
                    changeStatus={this.changeStatus} changeAssignee={this.changeAssignee}
                    setDragFlag={this.setDragFlag} updateIssuePosition={this.updateIssuePosition} 
                    changeDeviceWidth={this.changeDeviceWidth} savedIssues={savedIssues}
                    enableIssueCommentEditing={this.enableIssueCommentEditing} reply={this.reply}/>


                <CodeEditor {...this.state} hideEditor={this.hideEditor} onCodeEditorChange={this.onCodeEditorChange}/>
                <Patterns setDragFlag={this.setDragFlag} patterns={this.props.projectDetails.content.patterns} />

                <Comments {...commentProps} toggleIssueStatus={this.toggleIssueStatus} 
                    toggleIssueAssignees={this.toggleIssueAssignees} projectMembers={this.props.projectDetails.members}
                    addNewIssue={this.addNewIssue}/>
                

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

                <Dialog
                    title={'Before You Continue'}
                    actions={confirmDialogActions}
                    modal={true}
                    ref="confirmDialog"
                    open={this.state.confirmSave}
                >
                   <p> Would you like to save your changes before leaving this page? </p>
                </Dialog> 

                <Snackbar
                    open={this.state.snackBarOpen}
                    message={this.state.snackBarMessage}
                    onRequestClose={this.closeSnackBar}
                />

            </div>
        );
    }

}

module.exports = withRouter(Content);
