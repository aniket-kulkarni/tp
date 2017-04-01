var React = require('react');
var CloseIcon = require('material-ui/lib/svg-icons/navigation/cancel');

class Chip extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hover : false
        };
    }

    _handleOnMouseEnter() {
        this.setState({hover: true});
    }

    _handleOnMouseLeave() {
        this.setState({hover: false});
    }

    onRemoveClick = () => {
        this.props.onRemoveClick(this.props.text,this.props.id);
    }

    render() {

        const iconStyle = {
            height: '20px',
            width: '20px',
            margin: '4px -6px 4px 4px',
            transition: 'none',
            cursor: 'pointer'
        };

        const chipStyle = {
            height: '32px',
            lineHeight: '32px',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: this.state.hover ? '#aaa' : '#efefef',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'default'
        };

        const iconColorDefault = 'rgba(0,0,0,0.3)';
        const iconColorHover = 'white';
        const iconColor = this.state.hover ? iconColorHover : iconColorDefault;

        return (
            <div onMouseEnter={this._handleOnMouseEnter.bind(this)}
                 onMouseLeave={this._handleOnMouseLeave.bind(this)}
                  style={chipStyle} >

                <div>{this.props.text}</div>
                <CloseIcon
                   style={iconStyle}
                   color={iconColor}
                   size={20}
                   onClick={this.onRemoveClick}
                />
            </div>
        );
    }

}

module.exports = Chip;
