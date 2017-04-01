var React = require('react');
var css = require('./content-editor.css');
var config = require('../../config/config.js');
var cx = require('classnames');

var Issue = require('./issue.jsx');
var util = require('../../util/util.js');

var CircularProgress = require('material-ui/lib/circular-progress');
var DropDownMenu = require('material-ui/lib/DropDownMenu');
var MenuItem = require('material-ui/lib/menus/menu-item');
var FontIcon = require('material-ui/lib/font-icon');
var Toggle = require('material-ui/lib/toggle');

var Select = require('react-select');

var globals = {};

var deviceWidths = {
    0 : 320,
    1 : 480,
    2 : 650,
    3 : 723,
    4 : 825,
    5 : 979
};

class ContentEditor extends React.Component {

    constructor(props) {
        super(props);
        
        var pageNameOptions = this.getPageNameOptions(this.props.projectDetails.structure);
        this.projectStructure = this.props.projectDetails.structure;

        this.state = {
            pageNameOptions,
            elementOverlay : {
                selected : false,
                active : false,
                top : '',
                left : '',
                height : '',
                width : ''
            },
            insertLink : {
                active : false,
                type : 1,
                url : '',
                pageName : '',
                top : '',
                left : '',
                edit : false
            },
            displayLinkOverlay : {
                active : false,
                top : '',
                left : '',
                url : '' 
            }
        };

        this.lastUuid = null;
        this.deleteElement = this.deleteElement.bind(this);
    }

    componentDidUpdate(prevProps) {
        
        if ((this.props.fileContentStatus === 'success' &&
            prevProps.fileContentStatus === 'loading')) {
            
            this.initNewFrame(this.props.fileContent);
        }

        else if (this.props.fileContentChangeOrigin === 'codeEditorChange' && 
            this.props.fileContent !== prevProps.fileContent) {

            this.updateFrameContent(this.props.fileContent);
        }

        else if (this.props.editMode !== prevProps.editMode) {
            this.frame.contentDocument.body.setAttribute('contentEditable', this.props.editMode);
        }
        
    } 

    componentWillUpdate(nextProps) {
        
        if ((this.props.fileContentStatus === 'success' &&
            nextProps.fileContentStatus === 'loading')) {
            
            this.removeExistingFrame();
        }
       
    }

    componentWillReceiveProps(nextProps) {
        
        if (!(this.projectStructure === nextProps.projectDetails.structure)) {
            this.projectStructure = nextProps.projectDetails.structure;
            var pageNameOptions = this.getPageNameOptions(this.projectStructure);
            this.setState({pageNameOptions});
        }
    }

    componentWillUnmount() {
        this.removeExistingFrame();
    }

    getPageNameOptions(structure) {
        
        var pageOptions = [];

        structure.children.forEach((chapter) => {
            
            chapter.files.forEach((file) => {
                var option = { label : `${file.title}(${chapter.title})`};
                option.value = `${chapter.name}/${file.name}`;
                pageOptions.push(option);
            });

        });

        return pageOptions;
    }

    updateFrameContent = (content) => {

        var parser = new DOMParser(),
            parserDoc = parser.parseFromString(content, 'text/html');

        var newBody = parserDoc.getElementsByTagName('body')[0].innerHTML;

        var frameDoc = this.frame.contentDocument;
        frameDoc.body.innerHTML = newBody;
        this.frame.height = frameDoc.body.scrollHeight + 'px';
        
    }

    removeExistingFrame() {

        if ($('#editor-iframe-container > iframe').length) {
            this.unbindFrameEvents();
            $('#editor-iframe-container > iframe').remove();
            this.iframe = null;
        }
    }

    initNewFrame(html) {

        var basePath = this.getFrameBasePath(this.props.locationPathname),
            baseUrl = config.apiServerUrl + basePath,
            base = `<base href="${baseUrl}">`,
            n = html.indexOf('<head>');

        var newhtml = [html.slice(0, n + 6), base, html.slice(n + 6)].join('');

        var iframe = document.createElement('iframe');        
        $('#editor-iframe-container').prepend(iframe);
        iframe.contentDocument.write(newhtml);
        iframe.contentDocument.close();
        iframe.contentDocument.body.setAttribute('contentEditable', this.props.editMode);
        iframe.contentDocument.body.setAttribute('style', 'font-size:100%');

        this.frame = iframe;

        $(iframe).on('load',() => {
            this.frameWidth = $(this.frame).width();
            this.setHighlighterWidth();
            this.bindFrameEvents();
            this.setHeight();
        });
    }

    getFrameBasePath = (pathname) => {
        
        var projectId = this.props.projectDetails.id;
        var basePath;

        if (pathname.includes(`${projectId}/file/`)) {

            let t = pathname.split(`${projectId}/file/`);
            
            //var chapterName = t[1].split('/')[0];
            basePath = '/api' + t[0] + projectId + '/assets/file/';

        } else {

            if (pathname[pathname.length - 1] === '/') {
                pathname = pathname.slice(0,pathname.length - 1);
            }

            basePath = '/api' + pathname + '/assets/file/';
        }

        return basePath;
    }

    setHighlighterWidth() {
        
        var doc = this.frame.contentDocument;
        var docWidth = $(doc).width(),
            marginLeft = parseInt($(doc.body).css('margin-left')),
            marginRight = parseInt($(doc.body).css('margin-right')),
            paddingLeft = parseInt($(doc.body).css('padding-left')),
            paddingRight = parseInt($(doc.body).css('padding-right'));

        var width = docWidth - (marginLeft + marginRight + paddingLeft + paddingRight);
        $('#highlighter').css('width', `${width}px`);
        $('#highlighter').css('margin-left', `${marginLeft + paddingLeft}px`);
        $('#comments-wrap').css('width', `${docWidth}px`);

    }


    bindFrameEvents() {

        $(this.frame.contentDocument).on('dragend', () => { this.handleDragEnd(); });
        $(document).on('dragend', () => { this.handleDragEnd(); });        
        $(this.frame.contentDocument).on('keyup', (e) => { this.handleFrameKeyUp(e); });
        $(this.frame.contentDocument).on('dragover', (e) => { this.handleFrameDragover(e); });        
        $(this.frame.contentDocument).on('drop', (e) => { this.handleDrop(e); });
        $(this.frame.contentDocument).on('mousedown', (e) => { this.handleMousedown(e); });
        $(this.frame.contentDocument).on('mouseup', (e) => { this.handleMouseup(e); });
        $('#editor-iframe-container').on('dragenter', (e) => { this.handleFrameDragleave(e); });
    }

    unbindFrameEvents() {
        $(this.frame.contentDocument).off('keyup');
        $(this.frame.contentDocument).off('dragover');
        $(this.frame.contentDocument).off('drop');
        $(this.frame.contentDocument).off('dragend');
        $(document).off('dragend');
        $('#editor-iframe-container').off('dragenter');
    }

    handleMousedown(e) {
        var elem = $(e.target).closest('.block').get(0);
        
        if (elem) {
            var elementOverlayState = this.state.elementOverlay;            
            elementOverlayState.selected = false;
            this.setState({elementOverlay : elementOverlayState});
            var uuid = elem.dataset.uuid;
            this.lastUuid = uuid;
            this.handleFocus(elem);
            clearTimeout(this.elementOverlayTimeout);
            this.elementOverlayTimeout = setTimeout(this.hideActiveOverlay,2500);
        } else {
            this.hideActiveOverlay();
        }

        this.hideInsertLinkOverlay();
    } 

    handleMouseup() {
        this.handleSelection();
    }

    handleSelection() {

        if (this.state.insertLink.active) {
            return;
        }

        var win = this.frame.contentWindow;
        var sel = win.getSelection();
        var frameDoc = this.frame.contentDocument;
        var range = sel.getRangeAt(0);

        var self = this;

        if (!sel.isCollapsed) {
            this.showActiveOverlay();

            let elementOverlayState = this.state.elementOverlay;            
            elementOverlayState.selected = true;
            
            var rects = range.getClientRects();
            let {top,left} = rects[0];

            for (let i = 1;i < rects.length; i++) {
                var newLeft = rects[i].left;
                if (left > newLeft && rects[i].width !== 0) {
                    left = newLeft;
                }
            }

            let textOptionsWrap = this.refs.textOptionsWrap;
            var frameWidth = this.frameWidth;
            var overlayWidth = $(textOptionsWrap).width();

            var deltaLeft = overlayWidth + left > frameWidth ? (overlayWidth + left - frameWidth) : 0;

            if (deltaLeft) {
                left = left - deltaLeft;
            }

            top = top - this.lastElementOverlayBounds.top;
            left = left - this.lastElementOverlayBounds.left;

            $(textOptionsWrap).css({
                top,left
            });

            $(this.refs.textOptionsList).children().each((i,textOptionItem) => {
                let command = textOptionItem.dataset.command;

                if (command) {

                    if (self['query' + command.capitalizeFirstLetter()] && self['query' + command.capitalizeFirstLetter()]()) {
                        textOptionItem.classList.add(css.selected);
                    } else {
                        if (frameDoc.queryCommandState(command)) {
                            textOptionItem.classList.add(css.selected);
                        } else {
                            textOptionItem.classList.remove(css.selected);
                        }
                    }
                }
            });

            clearTimeout(this.elementOverlayTimeout);
            this.setState({elementOverlay : elementOverlayState});
        }

        var {displayLinkOverlay} = this.state;
        var link = this.queryLink();

        if (link) {
            let href = link.getAttribute('href');
            let rects = link.getClientRects();
            let {top,left,width} = rects[rects.length - 1];
            left = left + (width / 2);

            displayLinkOverlay.active = true;
            displayLinkOverlay.top = top;
            displayLinkOverlay.url = href;

            var {overlayLeft,pointerLeft} = this.getOverlayPos('linkOverlay',left);
            displayLinkOverlay.left = overlayLeft;
            displayLinkOverlay.pointerLeft = pointerLeft;

        } else {
            displayLinkOverlay.active = false;
        }

        this.setState({displayLinkOverlay});
    }

    getOverlayPos(overlayRef,left) {
        
        var overlayWidth = $(this.refs[overlayRef]).width(),
            frameWidth = $(this.frame).width() - 20;

        var overlayLeft,pointerLeft;

        var deltaLeft = overlayWidth + left - frameWidth;
        deltaLeft = deltaLeft > 0 ? deltaLeft : 0;
        
        if (deltaLeft > 0) {
            overlayLeft = left - deltaLeft;
            pointerLeft = deltaLeft;

            if (deltaLeft < 50 && left > 50) {
                overlayLeft = overlayLeft - (50 - deltaLeft);
                pointerLeft = 50 ;                
            }

        } else {
            var halfPos = overlayWidth / 2;

            if (halfPos > left) {
                overlayLeft = 6;
                pointerLeft = left - 6;
            } else {
                overlayLeft = left - halfPos;
                pointerLeft = halfPos;
            }
        }
        
        return {overlayLeft,pointerLeft};
    }

    queryLink() {

        var win = this.frame.contentWindow;
        var sel = win.getSelection();
        var range = sel.getRangeAt(0);

        var container = range.commonAncestorContainer;
        while (container.nodeType !== 1) {
            container = container.parentNode;   
        }

        if (container.nodeName.toUpperCase() === 'A') {
            return container;
        } else {
            return null;
        }
    }

    handleKeyup() {

        var elementOverlayState = this.state.elementOverlay; 
        var win = this.frame.contentWindow;
        var elem = win.getSelection().focusNode;
        elem = $(elem).closest('.block').get(0);

        if (elem) {
            var uuid = elem.dataset.uuid;
            
            elementOverlayState.selected = false;

            clearTimeout(this.elementOverlayTimeout);
            this.elementOverlayTimeout = setTimeout(this.hideActiveOverlay,2500);

            if (uuid !== this.lastUuid) {
                this.lastUuid = uuid;
                this.handleFocus(elem);
            } else {
                this.handleSelection();
            }
        } else {
            this.hideActiveOverlay();
        }

        this.setState({elementOverlay : elementOverlayState});
    } 

    handleFocus(elem) { 

        var topDelta = 6;       
        var leftDelta = 10;

        var {offsetTop,offsetLeft,offsetHeight,offsetWidth} = elem;
        
        this.showActiveOverlay();
        var {elementOverlay : elementOverlayState} = this.state;

        elementOverlayState.left = offsetLeft - (leftDelta/2);
        elementOverlayState.top = offsetTop  - (topDelta/2);
        elementOverlayState.height = offsetHeight + topDelta;
        elementOverlayState.width = offsetWidth + leftDelta;

        this.lastElementOverlayBounds = {
            left : offsetLeft,
            top : offsetTop
        };

        this.setState({elementOverlay : elementOverlayState});
    }

    showActiveOverlay = () => {
        $(document).on('mousedown',this.hideOverlayDoc);
        var elementOverlayState = this.state.elementOverlay; 
        elementOverlayState.active = true;        
        this.setState({elementOverlay : elementOverlayState});
    }

    hideOverlayDoc = (e) => {
        if ($(e.target).closest('.' + css.actionableOverlay).length || !($(e.target).closest('body').length) ) {
            return;  
        } else {
            this.hideAllOverlay();
        }
    }

    hideActiveOverlay = () => {
        var elementOverlayState = this.state.elementOverlay; 
        elementOverlayState.active = false;    
        this.setState({elementOverlay : elementOverlayState});
    }

    hideInsertLinkOverlay() {
        var {insertLink} = this.state; 
        insertLink.active = false;
        this.setState({insertLink});
    }

    hideAllOverlay = () => {
        $(document).off('mousedown',this.hideOverlayDoc);
        var {elementOverlay,insertLink,displayLinkOverlay} = this.state; 
        elementOverlay.active = false;    
        insertLink.active = false;
        insertLink.type = 1;
        insertLink.url = '';
        insertLink.pageName = '';
        displayLinkOverlay.active = false;
        this.setState({elementOverlay,insertLink,displayLinkOverlay});
    }

    handleDragEnd() {
        this.props.setDragFlag(false);
    }

    handleFrameKeyUp(e) {

        var val = $(this.frame.contentDocument.body).attr('contenteditable'),
            isContentEditable = (val === false || val === 'false') ? false : true;

        if (isContentEditable) {
            let keyCode = e.keyCode || e.which;
            if (keyCode === 13) {                
                this.handleEnterKey();
            }

            var keyCodes = [8,9,13,37,38,39,40,46];

            if (keyCodes.includes(keyCode)) {
                setTimeout(() => {
                    this.handleKeyup();
                },1);
            }
            
            clearTimeout(this.contentEditorChangeTimeout);
            this.contentEditorChangeTimeout = setTimeout(this.onContentEditorChange,250);
        }
    } 

    handleEnterKey() {

        var frameDoc = this.frame.contentDocument;
        var frameSelection = this.frame.contentWindow.getSelection();

        var focusNode = frameSelection.focusNode;
        var data = focusNode.data || '&nbsp;';

        var containerNode = focusNode;

        while (containerNode.nodeType != 1) {
            containerNode = containerNode.parentNode;
        }

        var divs = frameDoc.getElementsByTagName('div');
        var len = divs.length;

        for (let i = len - 1; i >= 0 ; i--) {

            let div = divs[i];

            if (div !== containerNode) {
                let newElement = frameDoc.createElement('p');
                newElement.setAttribute('data-uuid',util.generateUUID());
                $(newElement).addClass('block');
                newElement.innerHTML = div.innerHTML;
                $(div).replaceWith(newElement);
            }
        }

        if (containerNode.tagName.toLowerCase() !== 'p') {
            let newElement = frameDoc.createElement('p');
            newElement.setAttribute('data-uuid',util.generateUUID());
            $(newElement).addClass('block');
            newElement.innerHTML = data;
            $(containerNode).replaceWith(newElement);

            let range = frameDoc.createRange();
            range.setStart(newElement, 0);
            range.collapse(true);
            frameSelection.removeAllRanges();
            frameSelection.addRange(range);
        } else {
            $(containerNode).addClass('block');
            containerNode.setAttribute('data-uuid',util.generateUUID());
        }
    }

    handleDrop(e) {
        
        if (!this.props.dragFlag) {
            return;
        }

        var data = JSON.parse(e.dataTransfer.getData('data'));

        var elem = $(data.content);
        elem.addClass('block');
        elem.attr('data-uuid',util.generateUUID());

        if (globals.insert === 'before') {
            elem.insertBefore(globals.block);
        } else {
            elem.insertAfter(globals.block);
        }

        $('#highlighter').addClass('hide');
        this.onContentEditorChange();
    }

    handleFrameDragover(e) {
        
        e.preventDefault();

        if (!this.props.dragFlag) {
            return;
        }

        var block = $(e.target);

        if (!(e.target.classList.contains('block'))) {
            block = $(e.target).closest('.block');
        } 

        var offset = block.offset();

        if (offset) {

            globals.insert = 'before';
            globals.block = block.get(0);

            var top = offset.top;
            
            var height = block.height();
            var total = top + height;

            var mid = (total - top) / 2;
            var med = top + mid;
            var pageY = e.pageY;

            if (med > pageY) {
                $('#highlighter').css('top',top);
            } else {
                
                if (block.next().length) {
                    globals.block = block.next().get(0);
                    $('#highlighter').css('top',block.next().offset().top);
                } else {
                    globals.insert = 'after';
                    $('#highlighter').css('top',total);
                }
            }

            $('#highlighter').removeClass('hide');
        }


    }

    handleFrameDragleave(e) {
        if (e.target.id === 'editor-iframe-container') {
            $('#highlighter').addClass('hide');
        }
    }

    setHeight = () => {

        var frameDoc = this.frame.contentDocument;
        if (frameDoc.body.scrollHeight > 500) {
            this.frame.height = frameDoc.body.scrollHeight + 'px';
        } else {
            this.frame.height = 500 + 'px';
        }
    }

    onContentEditorChange = () => {

        var frameDoc = this.frame.contentDocument,
            html = frameDoc.documentElement.outerHTML,
            doctype = new XMLSerializer().serializeToString(frameDoc.doctype),
            htmlStr = doctype + '\n' + html;
            
        htmlStr = htmlStr.replace('contenteditable="true"',''); 
        htmlStr = htmlStr.replace('contenteditable=\'true\'',''); 
        htmlStr = htmlStr.replace('contenteditable',''); 
        
        this.setHeight();        
        this.props.onContentEditorChange(htmlStr);
    }

    handleDeviceChange = (event, index, val) => {

        var width = deviceWidths[val];

        $(this.frame).animate({
            width: width
        },500, () => {
            this.setHeight();
            this.setHighlighterWidth();
        });
        this.props.changeDeviceWidth(val);
    }

    deleteElement = () => {
        var uuid = this.lastUuid;

        var elem = this.frame.contentDocument.querySelector(`[data-uuid=${uuid}]`);
        var parent = $(elem).parent();
        $(elem).remove();

        if (parent.children().length == 0 && parent[0].tagName.toLowerCase() !== 'body') {
            $(parent).remove();
        }

        this.hideActiveOverlay();
        this.onContentEditorChange();
    }

    execCommand = (e) => {
        e.preventDefault();
        var {command} = e.currentTarget.dataset;
        this.frame.contentDocument.execCommand(command, false, null);
        this.onContentEditorChange();
    }

    toggleInsertLink = (e) => {
        e.nativeEvent.stopImmediatePropagation();
        var link = this.queryLink();

        if (link) {
            this.unlink(link);    
            this.hideActiveOverlay();
            this.onContentEditorChange();
        } else {
            this.showInsertLink();
        }
    }

    unlinkLink = () => {
        var link = this.queryLink();
        this.unlink(link);    
        this.hideActiveOverlay();
        this.onContentEditorChange();
    } 

    editLink = (e) => {
        e.nativeEvent.stopImmediatePropagation();
        this.showInsertLink(true);   
    }

    unlink(link) {
        $(link).replaceWith(link.innerHTML);
        var {displayLinkOverlay} = this.state;
        displayLinkOverlay.active = false;
        this.setState({displayLinkOverlay});
    }

    showInsertLink = (editMode) => {
        var {insertLink : insertLinkState, elementOverlay : elementOverlayState, displayLinkOverlay} = this.state;

        var range = this.frame.contentWindow.getSelection().getRangeAt(0);
        
        let rects = range.getClientRects();
        let {top,left,width} = rects[rects.length - 1];

        left = left + (width / 2);

        var {overlayLeft,pointerLeft} = this.getOverlayPos('insertLinkWrap',left);

        insertLinkState.left = overlayLeft;
        insertLinkState.pointerLeft = pointerLeft;

        insertLinkState.active = true;
        insertLinkState.top = top;

        elementOverlayState.selected = false;
        displayLinkOverlay.active = false;

        if (editMode) {
            insertLinkState.edit = true;
            insertLinkState.editLink = this.queryLink();
        } else {
            insertLinkState.edit = false;
        }

        
        this.setState({insertLink : insertLinkState, elementOverlay : elementOverlayState,displayLinkOverlay});
    }

    updateInsertLinkURL = (e) => { 
        var {insertLink} = this.state;
        insertLink.url = e.target.value;
        this.setState({insertLink});       
    }

    updateInsertLinkPageName = (value) => {
        var {insertLink} = this.state;
        insertLink.pageName = value;
        this.setState({insertLink});
    }

    handleInsertLinkTypeChange = (value) => { 
        var {insertLink} = this.state;
        insertLink.type = value;
        this.setState({insertLink});
    }

    cancelInsertLink = () => {
        this.hideInsertLinkOverlay();

        var {insertLink} = this.state;
        insertLink.type = 1;
        insertLink.pageName = '';
        insertLink.url = '';
        this.setState({insertLink});
    }

    insertLink = () => {

        var {insertLink} = this.state;
        var {filePath} = this.props;
        var {type,url,pageName} = insertLink;

        var link = '';
        if (type === 1 && pageName.trim()) {
            pageName = pageName.trim();
            var chapterName = filePath.split('/')[0];
            var insertChapterName = pageName.split('/')[0];

            if (chapterName === insertChapterName) {
                var insertFileName = pageName.split('/')[1];
                link = insertFileName;
            } else {
                link = '../' + pageName;
            }
        } else {
            link = url.trim();
            if ( link && !(link.startsWith('http://') || link.startsWith('https://')) ) {
                link = 'http://' + link;
            }
        }

        link = link.trim();

        if ( link ) {
            var existingLink = this.queryLink();

            if (existingLink) {
                existingLink.setAttribute('href',link);
            } else {
                this.execInsertLink(link);
            }
        }

        this.hideInsertLinkOverlay();

        insertLink.type = 1;
        insertLink.url = '';
        insertLink.pageName = '';

        this.setState({ insertLink });

        this.onContentEditorChange();
    }

    execInsertLink(link) {
        this.frame.contentDocument.execCommand('createLink', false, link);
    }

    render() {

        const progressStyle = {
            position : 'absolute',
            left : '48%'
        };

        const style = {
            position : 'relative',
            top : '250px'
        };

        const underlineStyle = {
            border: 'none'
        };

        const dropDwonStyle = {
            marginTop : '-6px'
        };
        const toggleStyles = {
            trackStyle : {
                backgroundColor : '#81C784'              
            },
            thumbStyle : {
                backgroundColor : '#4CAF50'
            }
        };

        var {elementOverlay,insertLink,displayLinkOverlay} = this.state;
        var insertLinkOptions =[
            { value : 1, label : 'Link Page' },
            { value : 2, label : 'Link URL' }
        ];

        return (
            <section className={css.root}>
                <div className={css.header}>
                    
                    <div className={css.toggleWrap}>
                        <Toggle
                            label="Edit" {...toggleStyles} onToggle={this.props.onModeChange} toggled={!this.props.editMode}
                        />
                    </div>

                    <DropDownMenu value={this.props.deviceWidthValue} onChange={this.handleDeviceChange} 
                        underlineStyle={underlineStyle} style={dropDwonStyle}>
                            <MenuItem value={0} primaryText='Mobile Portrait'/>
                            <MenuItem value={1} primaryText='Mobile Landscape'/>
                            <MenuItem value={2} primaryText='Web Min'/>
                            <MenuItem value={3} primaryText='Web'/>
                            <MenuItem value={4} primaryText='Tablet Portrait'/>
                            <MenuItem value={5} primaryText='Tablet Landscape'/>
                    </DropDownMenu>

                    <div className={css.grow}></div>

                    <div className={cx({'hide' : !this.props.editorHidden || !this.props.editMode })} onClick={this.props.showEditor}>
                        <FontIcon className={cx('material-icons',css.editorFontIcon)} color='black'>code</FontIcon>
                    </div>

                </div>

                <div className={css.content}>
                    {(this.props.fileContentStatus === 'loading') ?
                        <div style={style}>
                            <CircularProgress style={progressStyle}/>
                        </div> :
                        <div className={css.frameWrap}>   
                            <div id='editor-iframe-container' className={cx(css.frameContainer)}>
                                <aside id="highlighter" className={cx('hide',css.highlighter)}></aside>      

                                <aside ref="linkOverlay" className={cx(css.actionableOverlay,css.linkOverlay, {
                                    [css.active] : displayLinkOverlay.active
                                })} style={{
                                    top : displayLinkOverlay.top,
                                    left : displayLinkOverlay.left
                                }}>
                                    <div className={css.linkOverlayPointer} style={{
                                        left : displayLinkOverlay.pointerLeft
                                    }}></div>
                                    <div className={css.linkOverlayWrap}>
                                        <div className={cx(css.link,css.linkOverlaySeperator)}>{displayLinkOverlay.url}</div>
                                        <div onClick={this.editLink} className={cx(css.pointer,css.linkOverlaySeperator)}>Edit</div>
                                        <div onClick={this.unlinkLink} className={cx(css.pointer)}>Unlink</div>
                                    </div>
                                </aside>   

                                <aside ref="insertLinkWrap" className={cx(css.actionableOverlay,css.insertLinkWrap, {
                                    [css.active] : insertLink.active
                                })} style={{
                                    top : insertLink.top,
                                    left : insertLink.left
                                }}>
                                    <div className={css.insertLinkOverlayPointer} style={{
                                        left : insertLink.pointerLeft
                                    }}> </div>
                                    <Select
                                        name="insertLinkType"
                                        value={insertLink.type}
                                        options={insertLinkOptions}
                                        onChange={this.handleInsertLinkTypeChange}
                                        searchable={false}
                                        clearable={false}
                                        className={css.linkSelector}
                                    />

                                    {(insertLink.type === 1) ? 
                                        
                                        <Select
                                            options={this.state.pageNameOptions}
                                            className={cx(css.insertLinkPageName,css.linkValSelector)}
                                            onChange={this.updateInsertLinkPageName}
                                            value={insertLink.pageName}
                                        />
                                        :
                                        <input type="text"
                                            value={insertLink.url}
                                            onChange={this.updateInsertLinkURL}
                                            className={cx(css.insertLinkURL,css.linkValSelector)}
                                            style={{
                                                width : '200px'
                                            }}
                                        />
                                    }

                                    <a className={cx(css.btn,css.primaryBtn)} onClick={this.insertLink}>
                                        {
                                            insertLink.edit ? 'Update' : 'Add'
                                        }
                                    </a>
                                    <a className={cx(css.btn,css.cancelBtn)} onClick={this.cancelInsertLink}>Cancel</a>

                                </aside>      

                                <aside ref="elementOverlay" className={cx(css.elementOverlay, {
                                    [css.active] : elementOverlay.active,
                                    [css.selected] : elementOverlay.selected                                    
                                })}  style={
                                    {
                                        top : elementOverlay.top,
                                        left : elementOverlay.left,
                                        height : elementOverlay.height,
                                        width : elementOverlay.width
                                    }
                                }>
                                    <div className={css.elementOverlayOptionsWrap}>
                                        <ul className={css.optionsList}>
                                            <li className={cx(css.optionsListItem,css.moveOption)}>
                                                <FontIcon style={{fontSize : '20px'}} className={cx('material-icons',css.optionsFontIcon)} color='white'>open_with</FontIcon>
                                            </li>
                                            <li className={css.optionsListItem} onClick={this.deleteElement}>
                                                <FontIcon style={{fontSize : '20px'}} className={cx('material-icons',css.optionsFontIcon)} color='#424242'>delete</FontIcon>
                                            </li>
                                        </ul>
                                    </div>

                                    <div ref="textOptionsWrap" className={css.textOptionsWrap}>
                                        <ul className={css.textOptionsList} ref="textOptionsList">
                                            <li className={cx(css.textOptionsListItem)} data-command="bold" onMouseDown={this.execCommand}>
                                                <FontIcon style={{fontSize : '24px'}} className={cx('material-icons',css.optionsFontIcon,css.textOptionsFontIcon)} color='#424242'>format_bold</FontIcon>
                                            </li>
                                            <li className={css.textOptionsListItem} data-command="italic" onMouseDown={this.execCommand}>
                                                <FontIcon style={{fontSize : '24px'}} className={cx('material-icons',css.optionsFontIcon,css.textOptionsFontIcon)} color='#424242'>format_italic</FontIcon>
                                            </li>
                                            <li className={css.textOptionsListItem} data-command="underline" onMouseDown={this.execCommand}>
                                                <FontIcon style={{fontSize : '24px'}} className={cx('material-icons',css.optionsFontIcon,css.textOptionsFontIcon)} color='#424242'>format_underlined</FontIcon>
                                            </li>
                                            <li className={css.textOptionsListItem} data-command="link" onMouseDown={this.toggleInsertLink}>
                                                <FontIcon style={{fontSize : '24px'}} className={cx('material-icons',css.optionsFontIcon,css.textOptionsFontIcon)} color='#424242'>insert_link</FontIcon>
                                            </li>
                                        </ul>
                                    </div>                                    
                                </aside>                                
                            </div>     
                                                   
                            {!(this.props.editMode) && 
                                <div className={css.commentsWrap} id="comments-wrap">
                                    {this.props.issues.map((issue,index) => {

                                        var savedIssue = this.props.savedIssues[index];
                                        var unassigned = false;
                                        if ( !savedIssue || (savedIssue && !savedIssue.assignee)) {
                                            unassigned = true;
                                        }

                                        var minimized = false;

                                        if ( !(issue.edit) && (issue.minimized)) {   
                                            minimized = true;
                                        }

                                        return (
                                            <Issue key={index} issue={issue} issueIndex={index} 
                                                projectMembers={this.props.projectDetails.members}
                                                author={this.props.author} updateComment={this.props.updateComment}
                                                toggleVisibilty={this.props.toggleIssueVisibilty}
                                                minimize={this.props.minimizeIssue} minimized={minimized}
                                                changeStatus={this.props.changeStatus}
                                                enableEditing={this.props.enableIssueCommentEditing}
                                                updateIssuePosition={this.props.updateIssuePosition}
                                                unassigned={unassigned} reply={this.props.reply}
                                                changeAssignee={this.props.changeAssignee}                                                     
                                            />
                                        );
                                    })}   
                                </div>
                            }
                        </div>                       
                    }                    
                </div>
            </section>
        );    
    }

}

module.exports = ContentEditor;
