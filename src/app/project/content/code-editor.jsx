var React = require('react');
var css = require('./code-editor.css');
require('../../../styles/code-editor.theme.css');
var {hintRules,config} = require('./code-editor.config.js');

var CodeMirror = require('codemirror/lib/codemirror.js');
var {HTMLHint} = require('htmlhint');
var htmlBeautifier = require('js-beautify').html;
var FontIcon = require('material-ui/lib/font-icon');
var cx = require('classnames');
var util = require('../../util/util.js');

require('codemirror/mode/xml/xml.js');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/lint/lint.css');
require('codemirror/addon/lint/lint.js');

require('../../../opensource-lib/codemirror/html-lint.js');

class CodeEditor extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {  
        this.editorInstance = CodeMirror(this.refs.editor, config);
        this.editorInstance.on('change',this.handleChange);
        this.editorInstance.on('beforeChange',handleBeforeChange);
    }

    componentDidUpdate(prevProps) {
        
        if ((this.props.fileContentStatus === 'success' &&
            prevProps.fileContentStatus === 'loading')) {
            let content = this.beautifyHtml(this.props.fileContent);
            this.editorInstance.setValue(content);
            setTimeout(() => {
                this.editorInstance.refresh();
            }, 0);
        }

        else if ( this.props.fileContentChangeOrigin === 'contentEditorChange' && 
                this.props.fileContent !== prevProps.fileContent) {
            this.updateCodeEditor(this.props.fileContent);
        }
        else if ((this.props.editMode !== prevProps.editMode) && this.props.editMode) {
            this.editorInstance.refresh();
        }
        
    } 

    componentWillUpdate(nextProps) {
        
        if ((this.props.fileContentStatus === 'success' &&
            nextProps.fileContentStatus === 'loading')) {
            
            this.editorInstance.setValue('');
        }
       
    }

    focusEditor = (e) => {
        if (e.target === e.currentTarget) {
            this.editorInstance.focus();
        } 
    }

    updateCodeEditor = (content) => {
        content = this.beautifyHtml(content);
        this.editorInstance.setValue(content);
        setTimeout(() => {
            this.editorInstance.refresh();
        }, 0);
    }

    beautifyHtml(htmlStr) {
        return htmlBeautifier(htmlStr,{extra_liners : ['head','body','/html','/body']});
    }

    handleChange(cm,changeObj) {

        if (changeObj.origin === 'setValue') {
            return;
        }

        var content = cm.getValue();
        var errors = HTMLHint.verify(content, hintRules);

        if (!errors.length) {
            this.props.onCodeEditorChange(content);
        }
    }

    render() {
        return (

           <section id="editor-wrap" className={css.root}>

               <div className={css.header}>
                   <div className={css.title}>HTML</div>
                   <div className={css.close} onClick={this.props.hideEditor}>
                       <FontIcon className={cx('material-icons',css.closeFontIcon)} color="#ffffff">close</FontIcon>
                   </div>     
               </div>

               <div className={css.content}>
                    <div ref="editor" className={css.editor} onClick={this.focusEditor}></div>
               </div>
           </section>
        );
    }

}

function handleBeforeChange(cm,changeObj) {

    var text = changeObj.text,
        char = text[0];

    if (char === '>') {
        addDataUUIDToTags(cm,changeObj,char);
    }
    else if (text.length === 2 && text[0] === '' && text[1] === '') {
        handleNewLine(cm,changeObj);
    }
}

function addDataUUIDToTags(cm,changeObj) {

    var lineNo = changeObj.from.line,
        colNo = changeObj.from.ch;


    let tagDetails = getTagDetails(cm,lineNo,colNo);
    
    if ( tagDetails && !tagDetails.containsUUID) {

        let uuid = util.generateUUID();
        let updateTag = ` data-uuid="${uuid}"></${tagDetails.tagName}> `; 

        changeObj.update(changeObj.from,changeObj.to,[updateTag]);

        let cursorPos = (changeObj.from.ch + updateTag.length - tagDetails.tagName.length - 4);
        setTimeout(function() {
            cm.setCursor(lineNo,cursorPos);
        }, 10);
    }

}

function handleNewLine(cm,changeObj) {

    var lineNo = changeObj.from.line,
        colNo = changeObj.from.ch,
        line = cm.getLine(lineNo);

    if (line[colNo] === '<' && line[colNo + 1] === '/' && line[colNo - 1] === '>') {
        //
    }

}

function getTagDetails(cm,lineNo,colNo) {

    var line = cm.getLine(lineNo),
        tag = '',
        tagExists = false;

    for (let i = colNo - 1; i >= 0; i--) {

        if (line[i] === '/') {
            break;
        }

        if ( line[i] === '<') {
            tagExists = true;
            break;
        }

        tag += line[i];
    }

    if (tagExists) {

        tag  = tag.split('').reverse().join('');

        let tagName = tag.split(' ')[0];

        let regex = (/data-uuid="\w+"/i);
        let containsUUID = regex.test(tag);

        return {
            containsUUID,
            tagName
        };
    }
    else {
        return null;
    }

}

module.exports = CodeEditor;
