var React = require('react');
var css = require('./table-of-contents.css');
var Treebeard = require('../../../opensource-lib/react-treebeard/components/treebeard.js').default;
var decorators = require('../../../opensource-lib/react-treebeard/components/decorators.js').default;
var FontIcon = require('material-ui/lib/font-icon');
var treeStyles = require('./treeStyle.js');
var Popover = require('material-ui/lib/popover/popover');
var Menu = require('material-ui/lib/menus/menu');
var MenuItem = require('material-ui/lib/menus/menu-item');
var TextField = require('material-ui/lib/text-field');
var ProjectSerivce = require('../project-service.js');
var cx = require('classnames');

var {statusColors} = require('./issueConfig.js');

const animations = {
    toggle: (props) => {
        return {
            animation: { rotateZ: props.node.toggled ? 90 : 0,
                         translateX : props.node.toggled ? '4px' : 0,
                         translateY : props.node.toggled ? '6px' : 0 },
            duration: 300
        };
    },
    drawer: (/* props */) => {
        return {
            enter: {
                animation: 'slideDown',
                duration: 150
            },
            leave: {
                animation: 'slideUp',
                duration: 150
            }
        };
    }
};

class TableOfContents extends React.Component {

    constructor(props) {

        super(props);

        this.projectStructure = this.props.projectDetails.structure;

        /* transformProjectStructure is to transform the projectStructure that we get from server
         * into the fromat that react treebeard expects. Please see react treebeard for more info */

        var data = this.transformProjectStructure(this.projectStructure,this.props);

        var chapterIndex = 0,fileIndex = 0;

        if (this.isBookMarked(this.props.locationPathname)) {            
            var index = this.getIndex(data,this.props.filePath);
            chapterIndex = index.chapterIndex;
            fileIndex = index.fileIndex;
        }

        if (isNaN(fileIndex)) {
            fileIndex = 0;
            chapterIndex = 0;
        }

        data[chapterIndex].toggled = true;
        data[chapterIndex].children[fileIndex].active = true;

        this.popoverInputFocused = false;

        this.state = {
            contextMenuOpen : false,
            contextInputOpen : false,
            contextInputValue : '',
            contextNode : null,
            data : data,
            cursor : data[chapterIndex].children[fileIndex],
            selectedChapterIndex : chapterIndex,
            selectedFileIndex : fileIndex
        };

        this.initializeDecorators();

    }

    getIssueCountNodes(node) {
        var chapterIssues = node.chapterIssues || node.fileIssues;
        var nodes = [];
        var index = -1;

        if (chapterIssues) {
            for (var status in chapterIssues) {
                index++;
                let style = {
                    backgroundColor : statusColors[status]
                };
                nodes.push(
                    <span key={index} style={style} className={css.issueCount}>{chapterIssues[status]}</span>
                );
            }
        }

        return nodes;
    }

    initializeDecorators() {
        
        decorators.Header = (props) => {
            const style = props.style;
            const iconType = 'content_paste';
            var textStyle = {};
            var iconStyle = {
                fontSize : '18px'
            };

            if (!(props.node.children)) {
                textStyle.position = 'relative';
                textStyle.left = '8px';
                textStyle.top = '-4px';
            }

            textStyle.fontSize = '13px';
            
            return (
                <div style={style.base}>
                    <div style={style.title}>
                        <div style={{display : 'inline-block',width : '100px'}}>
                            {!(props.node.children) ?<FontIcon color="rgba(0,0,0,0.35)" style={iconStyle} className="material-icons">{iconType}</FontIcon> : '' }
                            <span style={textStyle}>{props.node.name}</span>
                        </div>
                        <div className={css.issueCountWrap}>
                            {this.getIssueCountNodes(props.node)}
                        </div>
                    </div>                    
                </div>
            );
        };
    }

    componentWillReceiveProps(nextProps) {
        
        if (!(this.projectStructure === nextProps.projectDetails.structure)) {

            this.projectStructure = nextProps.projectDetails.structure;

            let data = this.transformProjectStructure(this.projectStructure,this.props);

            var lastCursorChapterIndex = this.lastChapterIndex;
            var lastCursorFileIndex = this.lastFileIndex;

            data[lastCursorChapterIndex].toggled = true;
            data[lastCursorChapterIndex].children[lastCursorFileIndex].active = true;

            this.setState({
                data,
                cursor : data[lastCursorChapterIndex].children[lastCursorFileIndex],
                selectedChapterIndex : lastCursorChapterIndex,
                selectedFileIndex : lastCursorFileIndex
            });

            if (this.updateUrl) {
                var chapterName = data[lastCursorChapterIndex].name;
                var fileName = data[lastCursorChapterIndex].children[lastCursorFileIndex].fileName;
                this.props.onFileChange(`${chapterName}/${fileName}`);
            }
        } 
        else if (this.props.locationPathname !== nextProps.locationPathname) {

            let data = this.state.data;

            let index = this.getIndex(data,nextProps.filePath);
            let chapterIndex = index.chapterIndex;
            let fileIndex = index.fileIndex;


            if (this.state.cursor) { 
                this.state.cursor.active = false;
            }
            
            data[chapterIndex].toggled = true;
            data[chapterIndex].children[fileIndex].active = true;

            this.setState({ 
                cursor: data[chapterIndex].children[fileIndex],
                selectedChapterIndex : chapterIndex,
                selectedFileIndex : fileIndex
            });
        }
        else if (this.props.issues !== nextProps.issues) {
            let {selectedChapterIndex,selectedFileIndex} = this.state;
            let data = this.transformProjectStructure(this.projectStructure,nextProps);

            data[selectedChapterIndex].toggled = true;
            data[selectedChapterIndex].children[selectedFileIndex].active = true;

            this.setState({ 
                data,
                cursor: data[selectedChapterIndex].children[selectedFileIndex],
                selectedChapterIndex,
                selectedFileIndex
            });
            
        }
    }

    componentDidUpdate() {

        if (this.state.contextInputOpen && !this.popoverInputFocused) {
            
            setTimeout(() => {
                this.popoverInput.focus();
                this.popoverInputFocused = true;
            },0);
        }
    }

    onToggle = (node, toggled) => {

        if (node.children) {
            node.toggled = toggled; 
            this.forceUpdate();
        } else {
            if (this.state.cursor === node) {
                return;
            }
            this.props.onFileChange(`${node.chapterName}/${node.fileName}`);
        }

    }

    isBookMarked = (pathname) => {
        
        var projectId = this.props.projectDetails.id;
        var isBookMarked = false;

        if (pathname.includes(`${projectId}/file/`)) {
            isBookMarked = true;
        } 

        return isBookMarked;
    }

    getIndex = (data,filePath) => {
        var chapterName = filePath.split('/')[0];
        var chapter;
        var fileName = filePath.split('/')[1];
        var chapterIndex,fileIndex;

        data.every((ch,index) => {
            if (ch.name === chapterName) {
                chapter = ch;
                chapterIndex = index;
                return false;
            } else {
                return true;
            }
        });

        chapter.children.every((ch,index) => {
            if (ch.fileName === fileName) {
                fileIndex = index;
                return false;
            }
            return true;
        });

        return {fileIndex,chapterIndex};
    }

    transformProjectStructure = (data,props) => {

        var transformedData = [];
        var {issuesCountByFile,issuesCountByChapter} = props;

        data.children.forEach((child,i) => {

            var chapter = {};
            chapter.name = child.name;
            chapter.children = [];
            chapter.index = i;
            var chapterIssues = issuesCountByChapter[chapter.name];

            if (chapterIssues) {
                chapter.chapterIssues = chapterIssues;
            }
            
            child.files.forEach((file,j) => {

                var filePath = child.name + '/' + file.name;
                var fileIssues = issuesCountByFile[filePath];

                var obj = {
                    name : (file.title),
                    index : `${i}.${j}`,
                    fileName : file.name,
                    chapterName : child.name
                };

                if (fileIssues) {
                    obj.fileIssues = fileIssues;
                }

                chapter.children.push(obj);
            });

            transformedData.push(chapter);   
        });
        
        return transformedData;

    }

    onContextMenu = (node, event) => {

        if (!node.children) {
            event.preventDefault();
            this.setState({
                contextMenuOpen: true,
                anchorEl: event.currentTarget,
                contextNode : node
            });
        }
    }

    closeContextMenu = () => {

        this.setState({
            contextMenuOpen: false,
            contextNode : null,
            anchorEl : null
        });
    }

    closeContextInput = () => {
        this.popoverInputFocused = false;
        this.setState({
            contextInputOpen: false,
            contextInputValue : ''
        });
    }

    showContextualInput = (funcContext) => {

        this.funcContext = funcContext;

        this.setState({
            contextMenuOpen: false,
            contextInputOpen: true
        });
    }

    addPage = () => {

        this.props.showSnackBarMessage('Adding New Page');

        var fileDetails = this.getFileDetails();
        var pageTitle= this.state.contextInputValue;

        this.lastChapterIndex = parseInt(this.state.cursor.index.split('.')[0]);
        this.lastFileIndex = parseInt(this.state.cursor.index.split('.')[1]);

        if (fileDetails.fileIndex < this.lastFileIndex) {
            this.lastFileIndex++;
        }

        this.closeContextInput();

        ProjectSerivce.addNewPage(this.props.projectDetails.id, fileDetails,pageTitle)
            .then((data) => {
                this.props.hideSnackBarMessage();
                this.props.updateProjectStructure(data);
            })
            .catch((rejection) => {
                this.props.hideSnackBarMessage();
                this.props.onError(rejection.error.message);
            });
    }

    renamePage = () => {

        this.props.showSnackBarMessage('Renaming Page');
        this.closeContextInput();
        
        this.lastChapterIndex = parseInt(this.state.cursor.index.split('.')[0]);
        this.lastFileIndex = parseInt(this.state.cursor.index.split('.')[1]);

        var fileDetails = this.getFileDetails();
        var newName = this.state.contextInputValue;

        ProjectSerivce.renamePage(this.props.projectDetails.id, fileDetails,newName)
            .then((data) => {
                this.props.hideSnackBarMessage();
                this.props.updateProjectStructure(data);
            })
            .catch((rejection) => {
                this.props.hideSnackBarMessage();
                this.props.onError(rejection.error.message);
            });
    }

    deletePage = () => {

        this.props.showSnackBarMessage('Deleting Page');
        this.closeContextMenu();
        this.updateUrl = false;

        this.lastChapterIndex = parseInt(this.state.cursor.index.split('.')[0]);
        this.lastFileIndex = parseInt(this.state.cursor.index.split('.')[1]);

        var fileDetails = this.getFileDetails();

        if (fileDetails.fileIndex < this.lastFileIndex) {
            this.lastFileIndex--;
        }
        else if (fileDetails.fileIndex === this.lastFileIndex) {

            if (this.lastFileIndex !== 0) {
                this.lastFileIndex--;
            }
            this.updateUrl = true;
        }

        ProjectSerivce.deletePage(this.props.projectDetails.id, fileDetails)
            .then((data) => {
                this.props.hideSnackBarMessage();
                this.props.updateProjectStructure(data);
            })
            .catch((rejection) => {
                this.props.hideSnackBarMessage();
                this.props.onError(rejection.error.message);
            });

    }

    getFileDetails = () => {
        
        var nodeIndex = this.state.contextNode.index;

        var chapterIndex = parseInt(nodeIndex.split('.')[0]);
        var fileIndex = parseInt(nodeIndex.split('.')[1]);

        var chapter = this.state.data[chapterIndex];
        var file = chapter.children[fileIndex];
        
        return {chapter,file,chapterIndex,fileIndex};
    }

    handleInputChange = (e) => {
        this.setState({
            contextInputValue : e.target.value
        });
    }

    handleKeyDown = (e) => {
        
        var keyCode = e.keyCode || e.which;
        const ENTER_KEY = 13;
        const ESCAPE_KEY = 27;

        if (keyCode === ENTER_KEY) {
            this[this.funcContext + 'Page'].call(this);
        } else if (keyCode == ESCAPE_KEY) {
            this.closeContextInput();
        }
    }

    render() {

        const itemStyle = {
            lineHeight : '30px',
            fontSize : '13px'
        };

        const contextInputWrapStyle = {
            padding : '1px 7px'
        };
        
        var contextInputStyle = {
            width : '138px',
            height : '38px',
            fontSize : '13px'
        };

        var hintStyle = {
            fontSize : '12px'
        };

        return (
            <section className={css.root}>

                <div className={css.header}>

                    <div ref='close' className={css.close}>
                        <FontIcon color="#616161" className={cx('material-icons',css.listFontIcon)}>list</FontIcon>
                    </div>

                    <div className={css.title}>Table of Contents</div>                    
                </div>

                <div className={css.content}>
                    <Treebeard
                        data={this.state.data}
                        onToggle={this.onToggle}
                        onContextMenu={this.onContextMenu}
                        decorators={decorators}
                        animations={animations}
                        style={treeStyles}
                    />

                    <Popover
                        open={this.state.contextMenuOpen}
                        anchorEl={this.state.anchorEl}
                        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                        targetOrigin={{horizontal: 'left', vertical: 'top'}}
                        onRequestClose={this.closeContextMenu}
                    >
                        <Menu>
                            <MenuItem primaryText="Add Page" style={itemStyle} onClick={this.showContextualInput.bind(this,'add')}/>
                            <MenuItem primaryText="Rename" style={itemStyle} onClick={this.showContextualInput.bind(this,'rename')}/>
                            <MenuItem primaryText="Delete" style={itemStyle} onClick={this.deletePage}/>
                        </Menu>
                    </Popover>

                     <Popover
                        open={this.state.contextInputOpen}
                        anchorEl={this.state.anchorEl}
                        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                        targetOrigin={{horizontal: 'left', vertical: 'top'}}
                        onRequestClose={this.closeContextInput}
                    >
                        <div style={contextInputWrapStyle}>
                            <TextField 
                                hintText="Page Name" 
                                value={this.state.contextInputValue}
                                onChange={this.handleInputChange}
                                onKeyDown={this.handleKeyDown}
                                ref={(node) => this.popoverInput = node}
                                id="testerer"
                                hintStyle={hintStyle} 
                                style={contextInputStyle}/>
                        </div>
                    </Popover>
                   
                </div>  

            </section>
        );
    }

}

module.exports = TableOfContents;
