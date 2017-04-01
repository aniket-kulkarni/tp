var React = require('react');
var css = require('./read.css');
var {hashHistory} = require('react-router');

var CircularProgress = require('material-ui/lib/circular-progress');
var FontIcon = require('material-ui/lib/font-icon');
var Dialog = require('material-ui/lib/dialog');
var RaisedButton = require('material-ui/lib/raised-button');
var TextField = require('material-ui/lib/text-field');

var Treebeard = require('../../opensource-lib/react-treebeard/components/treebeard.js').default;
var decorators = require('../../opensource-lib/react-treebeard/components/decorators.js').default;

var treeStyles = require('./treeStyle.js');
var ReadService = require('./read-service.js');

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

class Read extends React.Component {

    constructor(props) {
        super(props);
        this.getReadData(this.props.params.id);
        this.state = {
            showErrorDialog : false,
            errorMessage : '',
            structure : null,
            cursor : null,
            unbindScrollEvent : false,
            dataLoaded : false,
            authenticate : false,
            pin : '',
            invalidPin : false,
            authenticating : false
        };

        this.initializeDecorators();

    }

    componentWillReceiveProps(nextProps) {

        var newPath = nextProps.location.pathname,
            currentPath = this.props.location.pathname;

        if (newPath !== currentPath) {

            let filePath = this._getCurrentFilePath(nextProps.location.pathname);
            let chapterIndex,fileIndex;

            if (filePath) {
                let index = this.getIndex(this.state.structure,filePath);
                chapterIndex= index.chapterIndex;
                fileIndex = index.fileIndex;
            } else {
                chapterIndex = fileIndex = 0;
                let structure = this.state.structure;
                filePath = structure[0].name + '/' + structure[0].children[0].fileName;
            }

            this.showFile(filePath,chapterIndex,fileIndex);
        }
    }

    _getCurrentFilePath(pathname) {

        var id = this.props.params.id;
        var filePath;

        if (pathname.includes(`${id}/file/`)) {

            let t = pathname.split(`${id}/file/`);
            filePath = t[1];

            if (filePath[filePath.length - 1] === '/') {
                filePath = filePath.slice(0,filePath.length-1);
            }
        } 

        return filePath;
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

    getReadData(id) {
        ReadService.getReadData(id)
            .then((data) => {
                if (data.authenticate) {
                    this.setState({authenticate : true, dataLoaded : true});
                } else {
                    this.createFrames(data);
                }
            })
            .catch((rejection) => {
                this.setState({showErrorDialog : true, errorMessage : rejection.error.message});
            });
    }

    createFrames(data) {
        var {style,chapters} = data.content;
        var structure = this.transformProjectStructure(data.structure);

        chapters.forEach((chapter,i) => {

            chapter.subChapters.forEach((subChapter,j) => {
                
                var iframe = document.createElement('iframe');
                $(this.refs.frameContainer).append(iframe);

                var newHtml = `<html style="overflow-y:auto;">
                    <head>
                        <style>
                            ${style}
                        </style>
                    </head>
                    <body>
                        ${subChapter.data}
                    </body>
                </html>`;

                iframe.contentDocument.write(newHtml);
                iframe.contentDocument.close();
                iframe.id = `${chapter.name}/${subChapter.name}`;
                iframe.setAttribute('data-chapterindex',i);
                iframe.setAttribute('data-fileindex',j);
                iframe.height = iframe.contentDocument.body.scrollHeight + 'px';
                iframe.style='min-height : calc(100vh - 40px)';
            });

        });
        
        var chapterIndex = 0,fileIndex = 0;
        structure[chapterIndex].toggled = true;
        var cursor = structure[chapterIndex].children[fileIndex];
        cursor.active = true;

        this.iframes = $('iframe');
        this.setState({structure,cursor,dataLoaded : true,authenticate : false, authenticating: false});

        let filePath = this._getCurrentFilePath(this.props.location.pathname);

        if (filePath) {
            let index = this.getIndex(this.state.structure,filePath);
            chapterIndex= index.chapterIndex;
            fileIndex = index.fileIndex;
            this.showFile(filePath,chapterIndex,fileIndex);
        } 
    }

    transformProjectStructure = (data) => {

        var transformedData = [];

        data.children.forEach((child,i) => {

            var chapter = {};
            chapter.name = child.name;
            chapter.children = [];
            chapter.index = i;
            
            child.files.forEach((file,j) => {

                var obj = {
                    name : (file.title),
                    chapterIndex : i,
                    fileIndex : j,
                    fileName : file.name,
                    chapterName : child.name
                };

                chapter.children.push(obj);
            });

            transformedData.push(chapter);   
        });
        
        return transformedData;
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

            textStyle.color = '#b0b0b2';
            textStyle.fontSize = '13px';
            
            return (
                <div style={style.base}>
                    <div style={style.title}>
                        <div>
                            {!(props.node.children) ?<FontIcon color="#b0b0b2" style={iconStyle} className="material-icons">{iconType}</FontIcon> : '' }
                            <span style={textStyle}>{props.node.name}</span>
                        </div>
                    </div>                    
                </div>
            );
        };
    }

    onToggle = (node, toggled) => {

        if (node.children) {
            node.toggled = toggled; 
            this.forceUpdate();
        } else {
            if (this.state.cursor === node) {
                return;
            }

            hashHistory.push(`/read/${this.props.params.id}/file/${node.chapterName}/${node.fileName}`);            
        }

    }

    showFile(fileName,chapterIndex,fileIndex) {

        this.setState({unbindScrollEvent : true});

        var iframe = document.getElementById(fileName);
        var $target = $(iframe);
        var scrollElem = this.refs.frameContainer;
        var to = $target.offset().top + $(scrollElem).scrollTop() - 20;

        this.scrollTo(scrollElem,to,600,() => {
            var {structure,cursor} = this.state;
            cursor.active = false;
            structure[chapterIndex].toggled = true;
            var newCursor = structure[chapterIndex].children[fileIndex];
            newCursor.active = true;
            this.setState({cursor : newCursor,unbindScrollEvent : false});
        });
    }

    scrollTo(element, to, duration,cb) {

        if (duration <= 0) {
            cb();
            return;
        }
        var difference = to - element.scrollTop;
        var perTick = difference / duration * 10;

        setTimeout(() => {
            element.scrollTop = element.scrollTop + perTick;
            if (element.scrollTop == to) {
                cb();
                return;
            }
            this.scrollTo(element, to, duration - 10,cb);
        }, 10);
    }

    onScroll = () => {
        var scrollPos = $(this.refs.frameContainer).scrollTop();
        var delta = scrollPos + 100;
        var chapterIndex,fileIndex;

        this.iframes.each((index,elem) => {
            var {top,height} = $(elem).offset();
            top = top + scrollPos;

            if (delta >= top && top + height > delta) {
                chapterIndex  = elem.dataset.chapterindex;
                fileIndex = elem.dataset.fileindex;
                return false;
            }
        });

        if (!chapterIndex || !fileIndex) {
            return;
        }

        var {structure,cursor} = this.state;
        var newCursor = structure[chapterIndex].children[fileIndex];

        if (newCursor == cursor) {
            return;
        }

        cursor.active = false;
        structure[cursor.chapterIndex].toggled = false;
        structure[chapterIndex].toggled = true;
        newCursor.active = true;
        this.setState({cursor : newCursor});
    }

    authenticate = () => {
        
        if (this.state.authenticating) {
            return;
        }

        var {pin} = this.state;
        this.setState({authenticating : true});

        ReadService.getReadDataWithPin(this.props.params.id,{pin})
            .then((data) => {
                this.createFrames(data);
            })
            .catch(() => {
                this.setState({invalidPin : true, authenticating : false});
            });
        
    }

    updatePin = (e) => {
        var value = e.target.value;

        if (value.length <= 4) {
            this.setState({pin : e.target.value,invalidPin : false});
        }
    }

    render() {
        var {unbindScrollEvent} = this.state;

        let progressStyle = {
            position : 'fixed',
            top : '40%',
            left : '45%'
        };

        return (
            <div className={css.root}> 
                <div className={css.tableOfContent}>
                    {this.state.structure && 
                    <Treebeard
                        data={this.state.structure}
                        onToggle={this.onToggle}
                        decorators={decorators}
                        animations={animations}
                        style={treeStyles}
                    />}
                </div>
                <div id="frameContainer" ref="frameContainer" className={css.frameContainer} onScroll={unbindScrollEvent ? null : this.onScroll}>
                </div>  
                {!this.state.dataLoaded && <CircularProgress style={progressStyle}/>} 
                
                <Dialog
                    title="Authenticate"
                    modal={true}
                    ref="authenticateDialog"
                    open={this.state.authenticate}
                    contentStyle={{maxWidth : '300px'}}
                >
                    <TextField
                        hintText="Enter Pin"
                        floatingLabelText="Pin"
                        type="password"
                        value={this.state.pin}
                        onChange={this.updatePin}
                        className={css.pin}
                        style={{width : '80px'}}
                    />

                    <RaisedButton
                      label={this.state.authenticating ? 'Authenticating...' : 'Enter'}
                      onTouchTap={this.authenticate}
                      className={css.enterPin}
                      style={{marginLeft : '25px'}}
                    /> 

                    <br/>
                    {this.state.invalidPin && <span className={css.invalidPin}>Invalid Pin</span>}

                </Dialog>
    
                            
            </div>
        );
    }

}

module.exports = Read;
