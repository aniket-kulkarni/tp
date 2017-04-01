var React = require('react');
var css = require('./navigation.css');
var FontIcon = require('material-ui/lib/font-icon');
var RaisedButton = require('material-ui/lib/raised-button');
var IconMenu = require('material-ui/lib/menus/icon-menu');
var MenuItem = require('material-ui/lib/menus/menu-item');
var IconButton = require('material-ui/lib/icon-button');
var Divider = require('material-ui/lib/divider');
var cx = require('classnames');

class Navigation extends React.Component {

    constructor(props) {
        super(props);
    }

    getIcon(view) {

        const views = {
            dashboard : {iconName : 'dashboard', tooltip : 'Go To Dashboard'},
            content : {iconName :'content_paste',tooltip : 'Edit Content'},
            configure : {iconName :'subject',tooltip : 'Configure Project'},
            theme : {iconName :'line_style',tooltip : 'Customize Styles'},
            review : {iconName :'check_circle',tooltip : 'Review Errors'},
            manage : {iconName :'group',tooltip : 'Manage Access'},
            export : {iconName :'import_export',tooltip : 'Export and Distribute'}
        };

        var isSelectedView = (this.props.selectedView === view);

        var color = (isSelectedView ? '#29B6F6' : '#9e9e9e');
        color = (view === 'dashboard') ? '#558B2F' : color;
        var props = {color,className : 'material-icons'};

        props.hoverColor = (!isSelectedView) ? 'whitesmoke' : '';

        const style = {
            width : '20px',
            height : '20px',
            padding : '0'
        };

        const tooltipStyles = {
            fontSize : '12px',
            padding : '5px 10px',
            background : 'black'
        };

        var pos = (view === 'dashboard') ? 'bottom-right' : 'bottom-center';

        return (
            <IconButton style={style} tooltipStyles={tooltipStyles} tooltip={views[view].tooltip} tooltipPosition={pos}>
                <FontIcon {...props}>{views[view].iconName}</FontIcon>
            </IconButton>
        );
    }

    selectView = (e) => {

        e.preventDefault();
        var target = e.currentTarget,
            view = target.dataset.view,
            url = target.childNodes[0].getAttribute('href');

        this.props.selectView(view,url);
    }

    render() {

        const iconStyles = {
            fontSize : '23px'
        };

        const buttonStyles = {
            height : '28px',
            minWidth : '70px',
            borderRadius : '3px'
        };

        const buttonLabelStyles = {
            textTransform : 'capitalize',
            color : 'whitesmoke',
            fontSize : '12px'
        };

        return (
            <section className={css.root}>
                <header>

                    <div className="project-navigation">

                        <ul className={css.navItems}>
                            <li className={cx(css.navItem,css.seperator)} data-view="dashboard" ref="dashboard" onClick={this.selectView}>
                                <a href="/">
                                    {this.getIcon('dashboard')}
                                </a>
                            </li>
                            <li className={css.navItem} data-view="content" onClick={this.selectView} ref="content">
                                <a href="/project/:id">
                                    {this.getIcon('content')}
                                </a>
                            </li>
                            <li className={css.navItem} data-view="configure" onClick={this.selectView} ref="configure">
                                <a href="/project/:id/configure">
                                    {this.getIcon('configure')}
                                </a>
                            </li>
                            <li className={css.navItem} data-view="theme" onClick={this.selectView} ref="theme">
                                <a href="/project/:id/theme">
                                    {this.getIcon('theme')}
                                </a>
                            </li>
                            <li className={css.navItem} data-view="review" onClick={this.selectView} ref="review">
                                <a href="/project/:id/review" >
                                    {this.getIcon('review')}
                                </a>
                            </li>
                            <li className={css.navItem} data-view="manage" onClick={this.selectView} ref="manage">
                                <a href="/project/:id/manage">
                                    {this.getIcon('manage')}
                                </a>
                            </li>
                            <li className={cx(css.navItem,css.seperator)} data-view="export" onClick={this.selectView} ref="export">
                                <a href="/project/:id/export">
                                    {this.getIcon('export')}
                                </a>
                            </li>
                        </ul>

                    </div>

                    <div className={cx(css.projectDetails,css.seperator)}>
                        <div className={css.projectCover}>
                            <img src={this.props.projectDetails.coverUrl} alt="project-cover"/>
                        </div>
                        <div className={css.projectInfo}>
                            {this.props.projectDetails.name}
                        </div>
                    </div>

                    <div className={cx(css.navButtons,css.seperator)}>
                        <div className={cx(css.saveWrapper, {[css.dull] : !this.props.saveEnabled})}>
                            <RaisedButton
                                ref="save"
                                label="Save"
                                backgroundColor="#007d99"
                                onClick={this.props.save}
                                disabledBackgroundColor="#007d99"
                                style={buttonStyles}
                                labelStyle={buttonLabelStyles}
                                disabled={!this.props.saveEnabled}
                            />
                        </div>
                    </div>

                    <div className={css.userAccount} ref="userAccount">
                        <IconMenu
                            iconButtonElement={<IconButton> <FontIcon color="whitesmoke" style={iconStyles} className="material-icons">dehaze</FontIcon></IconButton>}
                            anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                            targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                        >

                            <MenuItem primaryText="My Account" />
                            <MenuItem primaryText="Authoring Guide" />
                            <MenuItem primaryText="Release Notes" />
                            <MenuItem primaryText="Support" />
                            <Divider />
                            <MenuItem primaryText="Sign out" onClick={this.props.logout}/>

                        </IconMenu>

                    </div>
                </header>
            </section>
        );
    }

}

Navigation.propTypes = {
    logout : React.PropTypes.func,
    selectView : React.PropTypes.func.isRequired
};

module.exports = Navigation;
