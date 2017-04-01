var React = require('react');
var css = require('./structure.css');
var FontIcon = require('material-ui/lib/font-icon');
var cx = require('classnames');

var alt = require('../../alt.js');
var ProjectActions = require('../project-actions.js');
var ProjectStore = require('../project-store.js');
var ProjectService = require('../project-service.js');
var async = require('../../util/async.js');

var Dialog = require('material-ui/lib/dialog');
var CircularProgress = require('material-ui/lib/circular-progress');

var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var FontIcon = require('material-ui/lib/font-icon');
var TextField  = require('material-ui/lib/text-field');
var {hashHistory,withRouter} = require('react-router');

var update = require('react-addons-update');

class Structure extends React.Component {

    constructor(props) {

        super(props);
        this.updateSaveEnabled = false;
        this.state = {
            sidebar : 'editStructure',
            chapterDrawIndex : -1,
            selectedChapterIndex : -1,
            selectedFileChapterIndex : -1,
            selectedFileIndex : -1,
            selectedFile : null,           
            structure : this.props.projectDetails.structure,
            confirmSave : false,
            status : null
        };

    }

    componentDidMount() {
        this.props.setSave(this.save);
        this.setLeaveHook();
        this.bindEvents();
        ProjectStore.listen(this.onChange);
    }

    componentWillUnmount() {
        this.unbindEvents();
        ProjectStore.unlisten(this.onChange);
    }

    componentDidUpdate() {
        if ( !(this.updateSaveEnabled) && this.state.structure !== this.props.projectDetails.structure) {
            this.updateSaveEnabled = true;
            this.props.enableSave(true);
        }
    }

    onChange = (state) => {

        if (this.state.structure !== state.projectDetails.structure) {
            this.props.enableSave(false);
            this.updateSaveEnabled = false;
            this.setState({structure : state.projectDetails.structure});
        }
    }

    setLeaveHook() {
        this.props.router.setRouteLeaveHook(this.props.route, (function(nextRoute) {
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
        }).bind(this));
    } 

    bindEvents() {
        $(document).on('dragover', (e) => { this.handleDragover(e); });
        $(document).on('dragend', (e) => { 

            if (this.dragType === 'chapter') {
                this.refs.chaptersList.classList.remove(css.toggled);
            }

            this.checkDrop(e);
            this.dragType = null;
        });

        $(this.refs.treeContent).on('drop', (e) => {this.handleDrop(e); });
    }

    unbindEvents() {
        $(document).off('dragover');
        $(document).off('dragend');
    }

    getRequestBody = () => {

        var newStructure = {};
        var structure = this.state.structure;

        newStructure.name = structure.name;
        newStructure.children = [];

        var deletedChapters = [],
            newChapters = [],
            newFiles = [],
            deletedFiles = [];

        var error = null;

        structure.children.forEach((chapter) => {
            
            if (chapter.new && !(chapter.deleted)) {
                newChapters.push({ name : chapter.name});
            } else if (chapter.deleted && !(chapter.new)) {
                deletedChapters.push({ name : chapter.name});
            }

            if (!(chapter.deleted)) {

                let newChapter = {
                    name : chapter.name,
                    title : chapter.title,
                    files : []
                };

                chapter.files.forEach((file) => {
                    
                    if (!(file.deleted) && ( file.new || chapter.new)) {
                        newFiles.push({ 
                            chapterName : chapter.name , fileName : file.name
                        });
                    } else if (file.deleted && !(file.new)) {
                        deletedFiles.push({ 
                            chapterName : chapter.name , fileName : file.name
                        });
                    }

                    if (!(file.deleted)) {
                        let newFile = {
                            name : file.name,
                            title : file.title
                        };

                        newChapter.files.push(newFile);
                    }
                    
                });

                newStructure.children.push(newChapter);

                if (newChapter.files.length === 0) {
                    error = 'Cannot save because there is an empty chapter';
                }
            } 
            
        });

        if (newStructure.children.length === 0) {
            error = 'Cannot save because there are no chapters';
        }

        if (error) {
            return {
                error
            };
        } else {
            var reqBody = {
                new : {
                    chapters : newChapters,
                    files : newFiles
                },
                delete : {
                    chapters : deletedChapters,
                    files : deletedFiles
                },
                newStructure : newStructure
            };

            return reqBody;
        }
    }

    checkDrop = (e) => {
        
        if (!this.dropped) {

            var pageX = e.pageX,
                pageY = e.pageY;

            var treeContent = this.refs.treeContent;

            var {top,left} = $(treeContent).offset();
            var height = $(treeContent).height(),
                width = $(treeContent).width();

            if (pageY >= top && pageY < top + height &&
                pageX >= left && pageX < left + width) {

                this.handleDrop(e);
            }
        }
    }

    handleDragover = (e) => {

        e.preventDefault();
        var dragType = this.dragType;

        if (dragType === 'file') {
            this.handleFileDragover(e);
        } else {
            this.handleChapterDragover(e);
        }
    }

    handleChapterDragover = (e) => {

        var chapterDrawIndex;
        if ($(e.target).closest(this.refs.treeContent).length) {

            var chapterItem = $(e.target).closest('.' + css.chapterItem);

            if (chapterItem.length) {
                let chapterIndex = parseInt(chapterItem[0].dataset.chapterindex);
                chapterDrawIndex = chapterIndex;
            } else {
                var pageY = e.pageY;
                var wrap = $(this.refs.chaptersList);
                var top = wrap.offset().top;
                var height = wrap.height();

                if ((top + height) > pageY) {
                    chapterDrawIndex = this.state.chapterDrawIndex;
                } else {
                    chapterDrawIndex = this.state.structure.children.length;
                }
            }
        } else {
            chapterDrawIndex = -1;
        }

        if (chapterDrawIndex !== this.state.chapterDrawIndex) {
            this.setState({chapterDrawIndex});
        }
    }

    handleFileDragover = (e) => {

        var fileChapterDrawIndex,fileDrawIndex,ignore = false;

        if ($(e.target).closest(this.refs.treeContent).length) {

            var chapterItem = $(e.target).closest('.' + css.chapterItem);

            if (chapterItem.length) {

                let chapterIndex = parseInt(chapterItem[0].dataset.chapterindex);
                fileChapterDrawIndex = chapterIndex;

                let fileItem = $(e.target).closest('.' + css.fileItem);

                if (fileItem.length) {
                    let fileIndex = parseInt(fileItem[0].dataset.fileindex);
                    fileDrawIndex = fileIndex;
                } 
                else if ($(e.target).closest('.' + css.fileDrawPoint).length) {
                    ignore = true;
                } 
                else {
                    let cTop = chapterItem.offset().top,
                        cHeight = chapterItem.height(),
                        cMid = cHeight / 2,
                        cMedian = cTop + cMid,
                        pageY = e.pageY,
                        filesLen = chapterItem[0].dataset.fileslen;

                    fileDrawIndex =  (pageY > cMedian) ? parseInt(filesLen) : 0;
                }


            } else {
                let pageY = e.pageY;
                let wrap = $(this.refs.chaptersList);
                let top = wrap.offset().top;
                let height = wrap.height();

                if ((top + height) > pageY) {
                    fileChapterDrawIndex = 0;
                    fileDrawIndex = 0;
                } else {
                    fileChapterDrawIndex = this.state.structure.children.length - 1;
                    fileDrawIndex = this.state.structure.children[fileChapterDrawIndex].files.length;
                }
            }
        } else {
            fileChapterDrawIndex = -1;
        }

        if (!(ignore)) {
            this.setState({fileChapterDrawIndex,fileDrawIndex});
        }
    }

    getNodes = () => {

        var nodes = [];
        var chapterDrawClass = css.chapterDrawPoint;
        var fileDrawClass = css.fileDrawPoint;
        var chapterDrawActiveClass = chapterDrawClass  + ' '+ css.active;
        var fileDrawActiveClass = fileDrawClass  + ' '+ css.active;
        var chapterDrawIndex = this.state.chapterDrawIndex;
        var fileChapterDrawIndex = this.state.fileChapterDrawIndex;
        var fileDrawIndex = this.state.fileDrawIndex;

        nodes.push(
            <li className={(chapterDrawIndex === 0)  ? chapterDrawActiveClass : chapterDrawClass} 
                data-node="drop" data-type="chapter" key={'drop-0'}>                
            </li>
        );

        this.state.structure.children.forEach((chapter,chapterIndex) => {

            var filesLen = chapter.files.length;
            var fileNodes = [];
            
            chapter.files.forEach((file,fileIndex) => {

                let titleClass = css.fileTitle;
                titleClass = (file === this.state.selectedFile) ? (titleClass + ' ' + css.selectedFile) : titleClass;
                titleClass = (file.deleted) ? (titleClass + ' ' + css.deletedFile) : titleClass;

                fileNodes.push(
                    <li className={(fileChapterDrawIndex === chapterIndex && fileDrawIndex === fileIndex) ?
                        fileDrawActiveClass : fileDrawClass}
                        data-node="drop" data-type="file" key={'drop-' + chapterIndex + '.' + fileIndex}>
                    </li>,
                    <li data-fileindex={fileIndex} className={css.fileItem}  data-node="node" data-type="file" key={'file-' + chapterIndex + '.' + fileIndex}>
                        <span className={css.fileIcon}>
                            <FontIcon color="rgba(0,0,0,0.75)" style={{fontSize:'16px'}} className="material-icons">content_paste</FontIcon>
                        </span>
                        <span data-chapterindex={chapterIndex} data-fileindex={fileIndex} 
                            onClick={this.selectFile} className={titleClass}>{file.title}</span>
                    </li>
                );
            });

            fileNodes.push(
                <li className={(fileChapterDrawIndex === chapterIndex && fileDrawIndex === filesLen) ?
                    fileDrawActiveClass : fileDrawClass}
                    data-node="drop" data-type="file" key={'drop-' + chapterIndex + '.' +(filesLen)}>
                </li>
            );

            let itemClass = css.chapterItem;
            itemClass = chapter.deleted ? itemClass + ' ' + css.deletedChapter : itemClass;
            itemClass = chapter.toggled ? itemClass + ' ' + css.toggled : itemClass;

            nodes.push(
                <li data-chapterindex={chapterIndex} data-fileslen={filesLen} 
                    className={itemClass} 
                    data-node="node" data-type="chapter" key={'chapter-' + (chapterIndex)}>
                    <div className={css.chapterHeading}>
                        <span data-chapterindex={chapterIndex} onClick={this.toggleChapter} className={css.chapterToggle}></span>
                        <span className={(this.state.selectedChapterIndex === chapterIndex) ?  
                            (css.chapterTitle + ' ' + css.selectedChapter) : css.chapterTitle} 
                            data-chapterindex={chapterIndex} onClick={this.selectChapter}>
                            {chapter.title}
                        </span>
                    </div>
                    <ul className={css.fileList}>
                        {fileNodes}
                    </ul>
                </li>                
            );

            nodes.push(
                <li className={(chapterDrawIndex === chapterIndex + 1)  ? chapterDrawActiveClass : chapterDrawClass} 
                     data-node="drop" data-type="chapter" key={'drop-' + (chapterIndex + 1)}>
                </li>
            );

        });
        
        return nodes;
        
    }

    handleDragStart = () => {
        this.dragType = 'chapter';
        this.refs.chaptersList.classList.add(css.toggled);
        this.dropped = false;
    }

    handleFileDragStart = () => {
        this.dragType = 'file';
        this.dropped = false;
    }

    getChapterName = (structure) => {

        var index = structure.children.length + 1;
        var chapterName = 'Chapter-' + index;

        var exists = this.isChapterExists(chapterName,structure.children);

        while (exists) {
            index++;
            chapterName = 'Chapter-' + index;
            exists = this.isChapterExists(chapterName,structure.children);
        }

        return chapterName;
    }

    getFileName = (chapter) => {

        var index = chapter.files.length + 1;
        var fileName = 'file-' + index + '.html';

        var exists = this.isFileExists(fileName,chapter.files);

        while (exists) {
            index++;
            fileName = 'file-' + index + '.html';
            exists = this.isFileExists(fileName,chapter.files);
        }

        return fileName;
    }

    isChapterExists = (name,chapters) => {

        var exists = false;

        chapters.forEach((chapter) => {
            if (chapter.name === name) {
                exists = true;
                return false;
            }
        });

        return exists;
    }

    isFileExists = (name,files) => {

        var exists = false;

        files.forEach((file) => {
            if (file.name === name) {
                exists = true;
                return false;
            }
        });

        return exists;
    }

    handleDrop = (e) => {
        
        if (!this.dropped) {
            this.dropped = true;

            if (this.dragType === 'file') {
                this.handleFileDrop(e);
            } else {
                this.handleChapterDrop(e);
            }
        }
    }

    handleFileDrop = () => {

        var fileChapterDrawIndex = this.state.fileChapterDrawIndex;
        var selectedChapter = this.state.structure.children[fileChapterDrawIndex];

        if (!(selectedChapter.toggled)) {

            var name = this.getFileName(selectedChapter);

            var newFile = {
                name,
                title : 'untitled file',
                new : true
            };

            var fileDrawIndex = this.state.fileDrawIndex;
            var newData;

            if (fileDrawIndex === selectedChapter.files.length) {
                newData = update(this.state.structure, {
                    children: { [fileChapterDrawIndex] : {files :  {$push: [newFile]} }}
                });
            } else {
                newData = update(this.state.structure, {
                    children: { [fileChapterDrawIndex] : {files :  {$splice: [ [fileDrawIndex,0,newFile] ]} }}
                });
            }
        }

        this.setState({fileChapterDrawIndex : -1,fileDrawIndex : -1,structure : newData});  
    }

    handleChapterDrop = () => {

        var name = this.getChapterName(this.state.structure);
        var newChapter = {
            name,
            title : 'Untitled Chapter',
            new : true,
            files : [
                {
                    title : 'new',
                    name : 'file-1.html'
                }
            ]
        };

        var chapterDrawIndex = this.state.chapterDrawIndex;
        var newData;

        if (chapterDrawIndex === this.state.structure.children.length) {
            newData = update(this.state.structure, {
                children: {$push: [newChapter]}
            });
        } else {
            newData = update(this.state.structure, {
                children: {$splice: [ [chapterDrawIndex,0,newChapter] ]}
            });
        }

        this.setState({chapterDrawIndex : -1,structure : newData});  
    }

    toggleChapter = (e) => {
        var index = e.currentTarget.dataset.chapterindex;
        var toggled = !(this.state.structure.children[index].toggled);
        this.state.structure.children[index].toggled = toggled;
        this.forceUpdate();
    }

    selectChapter = (e) => {

        var index = e.currentTarget.dataset.chapterindex;
        this.setState({ 
            selectedChapterIndex : parseInt(index),
            sidebar : 'editChapter',
            selectedChapter : this.state.structure.children[index],
            selectedFileChapterIndex : -1,
            selectedFileIndex : -1,
            selectedFileChapter : null,
            selectedFile : null
        });
    }

    selectFile = (e) => {

        var chapterIndex = e.currentTarget.dataset.chapterindex;
        var fileIndex = e.currentTarget.dataset.fileindex;

        this.setState({ 
            selectedChapterIndex : -1,
            selectedChapter : null,
            selectedFileChapterIndex : parseInt(chapterIndex),
            selectedFileIndex : parseInt(fileIndex),
            sidebar : 'editFile',
            selectedFileChapter : this.state.structure.children[chapterIndex],
            selectedFile : this.state.structure.children[chapterIndex].files[fileIndex]
        });
    }

    handleChapterTitleChange = (e) => {

        var newData = update(this.state.structure, {
            children: { [this.state.selectedChapterIndex] : { title : {$set : e.target.value}  } }
        });
        this.setState({
            structure : newData, selectedChapter : newData.children[this.state.selectedChapterIndex]
        });
    }

    handleFileTitleChange = (e) => {

        var chapterIndex = this.state.selectedFileChapterIndex;
        var fileIndex = this.state.selectedFileIndex;

        var newData = update(this.state.structure, {
            children: { [chapterIndex] : { files : { [fileIndex] : { title : {$set : e.target.value} } } } }
        });
        this.setState({
            structure : newData,selectedFile : newData.children[chapterIndex].files[fileIndex]
        });
    }

    deleteChapter = () => {

        var newData = update(this.state.structure, {
            children: { [this.state.selectedChapterIndex] : { deleted : {$set : true}  } }
        });

        this.setState({
            structure : newData , selectedChapter : newData.children[this.state.selectedChapterIndex]
        });
    }

    restoreChapter = () => {
        var newData = update(this.state.structure, {
            children: { [this.state.selectedChapterIndex] : { deleted : {$set : false}  } }
        });

        this.setState({
            structure : newData , selectedChapter : newData.children[this.state.selectedChapterIndex]
        });
    }

    closeChapter = () => {
        this.setState({
            sidebar : 'editStructure',
            selectedChapterIndex : -1,
            selectedChapter : null
        });
    }

    deleteFile = () => {

        var chapterIndex = this.state.selectedFileChapterIndex;
        var fileIndex = this.state.selectedFileIndex;

        var newData = update(this.state.structure, {
            children: { [chapterIndex] : { files : { [fileIndex] : { deleted : {$set : true} } } } }
        });

        this.setState({
            structure : newData , selectedFile : newData.children[chapterIndex].files[fileIndex]
        });
    }

    restoreFile = () => {
        var chapterIndex = this.state.selectedFileChapterIndex;
        var fileIndex = this.state.selectedFileIndex;

        var newData = update(this.state.structure, {
            children: { [chapterIndex] : { files : { [fileIndex] : { deleted : {$set : false} } } } }
        });

        this.setState({
            structure : newData , selectedFile : newData.children[chapterIndex].files[fileIndex]
        });
    }

    closeChapter = () => {
        this.setState({
            sidebar : 'editStructure',
            selectedChapterIndex : -1,
            selectedChapter : null
        });
    }

    closeFile = () => {
        this.setState({ 
            selectedFileChapterIndex : -1,
            selectedFileIndex : -1,
            sidebar : 'editStructure',
            selectedFileChapter : null,
            selectedFile : null
        });
    }


    updateProjectStructure(newStructure) {
        alt.dispatcher.dispatch({action : ProjectActions.UPDATE_PROJECT_STRUCTURE, data : newStructure});
    }

    save = () => {

        var reqBody = this.getRequestBody();

        if (reqBody.error) {
            alert(reqBody.error); // eslint-disable-line no-alert
        } else {
            this.setState({status : 'loading'});               
            ProjectService.updateStrucutre(this.props.projectDetails.id,reqBody)
                .then(() => {     
                    this.setState({status : null});               
                    this.updateProjectStructure(reqBody.newStructure);
                })
                .catch((rejection) => {
                    this.setState({status : null});
                    alert(rejection.error.message); // eslint-disable-line no-alert
                });
        }

    }

    saveAndContinue = () => {

        var reqBody = this.getRequestBody();

        if (reqBody.error) {
            alert(reqBody.error);  // eslint-disable-line no-alert
        } else {
            this.setState({status : 'loading'});               
            ProjectService.updateStrucutre(this.props.projectDetails.id,reqBody)
                .then(() => {     
                    this.setState({status : null});               
                    this.updateProjectStructure(reqBody.newStructure);
                    async.then(() => {
                        hashHistory.push(this.state.pushAfterConfirmationUrl);
                    });
                })
                .catch((rejection) => {
                    this.setState({status : null});
                    alert(rejection.error.message); // eslint-disable-line no-alert
                });
        }
        
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

        const progressStyle = {
            position : 'fixed',
            top : '40%',
            left : '48%'
        };
        
        return (
            <div className={css.root}>
                <section ref="treeContent" className={css.content}>
                    <header className={css.header}>
                        Edit Structure
                    </header>

                    <div className={css.main}>
                        
                        <div ref="chaptersWrap" className={css.chaptersWrap}>
                            <ul ref="chaptersList" className={css.chaptersList}>
                                {this.getNodes()}
                            </ul>
                        </div>

                    </div>
                </section>

                <section className={css.sidebar}>

                    {this.state.sidebar === 'editStructure' &&
                        <section className={css.editStructure}>
                            <header className={css.sidebarHeader}> 
                                <h4> Add Structure </h4>
                            </header>

                            <div className={css.drawerWrap}>
                                <p className={css.drawerText}>
                                    Click and drag to add new items into the Table of Contents in the center.
                                </p>

                                <ul className={css.drawerList}>
                                    <li className={css.drawerItem} draggable="true" onDragStart={this.handleDragStart}>
                                        <span className={css.drawerIcon}>
                                            <FontIcon color="rgba(0,0,0,0.75)" style={{fontSize:'16px'}} className="material-icons">create_new_folder</FontIcon>
                                        </span>

                                        <span className={css.drawerText}>
                                            Chapter
                                        </span>
                                    </li>

                                    <li className={css.drawerItem} draggable="true" onDragStart={this.handleFileDragStart}>
                                        <span className={css.drawerIcon}>
                                            <FontIcon color="rgba(0,0,0,0.75)" style={{fontSize:'16px'}} className="material-icons">content_paste</FontIcon>
                                        </span>

                                        <span className={css.drawerText}>
                                            Page
                                        </span>
                                    </li>
                                </ul>

                            </div>
                        </section>
                    }    
                    
                    {this.state.sidebar === 'editChapter' &&
                        <section className={css.editChapter}>
                            <header className={css.sidebarHeader}> 
                                <h4> Chapter </h4>
                                <div className={css.close} onClick={this.closeChapter}>
                                   <FontIcon className={cx('material-icons',css.closeFontIcon)} color="#616161">close</FontIcon>
                                </div>
                            </header>
                            <div className={css.chapterMetaEdit}>
                                <TextField
                                    name="chapterTitle"
                                    ref="chapterTitle"
                                    hintText="Title"
                                    multiLine={true}
                                    fullWidth={true}
                                    floatingLabelText="Title"
                                    underlineStyle={{borderColor : 'white'}}
                                    value={this.state.selectedChapter ? this.state.selectedChapter.title  : ''}
                                    onChange={this.handleChapterTitleChange}
                                />
                            </div>
                            <div className={css.chapterActions}>

                                {
                                    !(this.state.selectedChapter.deleted )?    
                                        <RaisedButton
                                            ref="deleteChapter"
                                            label="Delete Chapter"
                                            onClick={this.deleteChapter}
                                        /> : 
                                        <RaisedButton
                                            ref="restoreChapter"
                                            label="Restore Chapter"
                                            onClick={this.restoreChapter}
                                        />
                                }
                            </div>
                        </section>
                    }

                    {this.state.sidebar === 'editFile' &&
                        <section className={css.editFile}>
                            <header className={css.sidebarHeader}> 
                                <h4> File </h4>
                                <div className={css.close} onClick={this.closeFile}>
                                   <FontIcon className={cx('material-icons',css.closeFontIcon)} color="#616161">close</FontIcon>
                                </div>
                            </header>
                            <div className={css.fileMetaEdit}>
                                <TextField
                                    name="fileTitle"
                                    ref="fileTitle"
                                    hintText="Title"
                                    multiLine={true}
                                    fullWidth={true}
                                    floatingLabelText="Title"
                                    underlineStyle={{borderColor : 'white'}}
                                    value={this.state.selectedFile ? this.state.selectedFile.title  : ''}
                                    onChange={this.handleFileTitleChange}
                                />
                            </div>
                            <div className={css.fileActions}>

                                {
                                    !(this.state.selectedFile.deleted )?    
                                        <RaisedButton
                                            ref="deleteFile"
                                            label="Delete File"
                                            onClick={this.deleteFile}
                                        /> : 
                                        <RaisedButton
                                            ref="restoreFile"
                                            label="Restore File"
                                            onClick={this.restoreFile}
                                        />
                                }
                            </div>
                        </section>
                    }
                    
                </section>

                <Dialog
                    title={'Before You Continue'}
                    actions={confirmDialogActions}
                    modal={true}
                    ref="confirmDialog"
                    open={this.state.confirmSave}
                >
                   <p> Would you like to save your changes before leaving this page? </p>
                </Dialog> 

                {(this.state.status === 'loading') &&
                    <div className="tp-loading-modal">
                        <CircularProgress style={progressStyle}/>
                    </div>
                } 
            </div>
        );
    }

}

module.exports = withRouter(Structure);
