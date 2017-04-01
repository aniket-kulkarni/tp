var React = require('react');
var css = require('./file-navigator.css');

var Treebeard = require('../../../opensource-lib/react-treebeard/components/treebeard.js').default;
var decorators = require('../../../opensource-lib/react-treebeard/components/decorators.js').default;
var FontIcon = require('material-ui/lib/font-icon');
var treeStyles = require('./treeStyle.js');

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

class FileNavigator extends React.Component {

    constructor(props) {
        super(props);
        this.projectStructure = this.props.projectDetails.structure;
        var data = this.getThemeData(this.projectStructure);
        data[0].active = true;

        this.state = {
            cursor : data[0],
            data
        };

        this.initializeDecorators();
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
                        {!(props.node.children) ?<FontIcon color="rgba(0,0,0,0.35)" style={iconStyle} className="material-icons">{iconType}</FontIcon> : '' }
                        <span style={textStyle}>{props.node.name} </span>
                    </div>
                </div>
            );
        };
    }

    getThemeData = () => {

        var transformedData = [];
       
        transformedData.push({
            name : 'main.css'
        });
        
        return transformedData;
    }

    onToggle = (node, toggled) => {

        if (node.children) {
            node.toggled = toggled; 
            this.forceUpdate();
        } else {
            if (this.state.cursor) {
                this.state.cursor.active = false;
            }
            node.active = true;
            if (node.children) { node.toggled = toggled; }
            this.setState({ cursor: node });
            //this.props.onFileChange(`${node.chapterName}/${node.fileName}`);
        }

    }

    render() {
        return (
            <div className={css.root}>

                <div className={css.header}>
                    <div className={css.title}>CSS</div>                    
                </div>

                <div className={css.content}>
                    <Treebeard
                        data={this.state.data}
                        onToggle={this.onToggle}
                        decorators={decorators}
                        animations={animations}
                        style={treeStyles}
                    />                  
                </div>

            </div>
        );
    }

}

module.exports = FileNavigator;
