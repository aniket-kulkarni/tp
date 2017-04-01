var React = require('react');
var css = require('./theme-editor.css');
var CodeMirror = require('codemirror/lib/codemirror.js');
var {config,lintRules} = require('./theme-editor.config.js');
var {CSSLint} = require('csslint');
require('codemirror/addon/lint/lint.css');
require('codemirror/addon/lint/lint.js');

require('codemirror/mode/css/css.js');
require('codemirror/lib/codemirror.css');
require('../../../opensource-lib/codemirror/css-lint.js');

class ThemeEditor extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount() {  
        this.editorInstance = CodeMirror(this.refs.editor, config);
        this.editorInstance.on('change',this.handleChange);
    }

    componentDidUpdate(prevProps) {
        
        if ((this.props.fileContentStatus === 'success' &&
            prevProps.fileContentStatus === 'loading')) {
            this.editorInstance.setValue(this.props.fileContent);
            setTimeout(() => {
                this.editorInstance.refresh();
            }, 0);
        }
    } 

    handleChange = (cm,changeObj) => {

        if (changeObj.origin === 'setValue') {
            return;
        }

        var content = cm.getValue();
        var errors = CSSLint.verify(content,lintRules);
        
        if (!errors.messages.length) {
            this.props.onEditorChange(content);
        } else {
            this.props.disableSave();
        }
    }

    render() {
        return (
            <div className={css.root}>
                <div className={css.header}>
                    <div className={css.title}>main.css</div>
                </div>

                <div className={css.content}>
                     <div ref="editor" className={css.editor}></div>
                </div>
            </div>
        );
    }

}

module.exports = ThemeEditor;
