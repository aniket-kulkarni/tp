var React = require('react');
var css = require('./dashboard.css');

var IconMenu = require('material-ui/lib/menus/icon-menu');
var MenuItem = require('material-ui/lib/menus/menu-item');
var IconButton = require('material-ui/lib/icon-button');
var Divider = require('material-ui/lib/divider');
var FontIcon = require('material-ui/lib/font-icon');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var Dialog = require('material-ui/lib/dialog');
var {FormsyText,FormsySelect} = require('formsy-material-ui');
var SearchBar = require('../components/search-bar');
var Formsy = require('formsy-react');
var cx = require('classnames');

var CircularProgress = require('material-ui/lib/circular-progress');

const iconStyles = {
    fontSize : '30px'
};

class DashboardView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            canSubmit : false
        };

        Formsy.addValidationRule('isAlphaNumericWords', function (values, value) {
            return /^[-\sa-zA-Z0-9]+$/.test(value);
        });
    }

    getLabelClass(item) {
        return `${css.filter} ` + ((item === this.props.selectedFilter) ? `${css.selected}` : '');
    }

    enableSubmitButton = () => {
        this.setState({
            canSubmit : true
        });
    }

    disableSubmitButton = () => {
        this.setState({
            canSubmit : false
        });
    }

    createProject = () => {
        this.setState({
            canSubmit : false
        });
        var inputs = this.refs.form.inputs;
        var model = {
            projectName : inputs.projectName.getValue(),
            organizationId : inputs.org.getValue()
        };

        this.props.createProject(model);

    }

    getCreateProjectUI = () => {

        const actions = [
            <FlatButton
                label='Cancel'
                onTouchTap={this.props.hideCreateProjectUI}
                id="create-project-cancel"
            />,
            <FlatButton
                label='Create'
                type="submit"
                primary={true}
                ref="createProjectBtn"
                onTouchTap={this.createProject}
                disabled={!this.state.canSubmit}
                id="create-project-submit"
            />              
        ];

        const progressStyle = {
            position : 'absolute',
            top : '40%',
            left : '40%'
        };

        return (
            <div className="create-project-wrap" ref="createProjectWrap">
                <Dialog
                    title="Create Project"
                    actions={actions}
                    modal={true}
                    open={true}
                    className="create-project-dialog"
                >

                    <Formsy.Form onValid={this.enableSubmitButton} ref="form"
                        onInvalid={this.disableSubmitButton} onsubmit={this.submit} >

                        <label htmlFor="createProject">Enter the name of the project</label> <br/>   
                        <FormsyText
                            name="projectName"
                            ref="projectName"
                            validations="isAlphaNumericWords"
                            validationError="Please enter  words"
                            required
                            hintText="Project Name"
                            floatingLabelText="Project Name"
                            id="create-project-name"
                        /> <br/>

                        <FormsySelect
                          name='org'
                          ref='org'
                          required
                          id="create-project-org"
                          floatingLabelText="Organization">

                            {this.props.organizations.map(function(org) {
                                return (
                                    <MenuItem key={org.id} value={org.id} primaryText={org.name} />
                                );
                            })}
                          
                        </FormsySelect>

                    </Formsy.Form>

                    {(this.props.createProjectStatus === 'loading') ? <CircularProgress style={progressStyle}/> : '' }
                    {(this.props.createProjectStatus === 'error') ? 
                        <p className="dialog-error"> * {this.props.error} </p> :
                    '' }

                </Dialog> 
            </div>
        );
    }

    getHeader = () => {
        return (
            <header className={css.header} ref="header">

                <div className={css.headerWrap}>
                
                    <div className={css.logoWrap}>
                        Tricon Publish
                    </div>

                    <div className="menu">
                        <IconMenu
                            iconButtonElement={<IconButton> <FontIcon color="whitesmoke" style={iconStyles} className="material-icons">dehaze</FontIcon></IconButton>}
                            anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                            targetOrigin={{horizontal: 'middle', vertical: 'bottom'}}
                        >

                            <MenuItem primaryText="My Account" />
                            <MenuItem primaryText="Authoring Guide" />
                            <MenuItem primaryText="Release Notes" />
                            <MenuItem primaryText="Support" />
                            <Divider />
                            <MenuItem primaryText="Sign out" onClick={this.props.logout}/>

                        </IconMenu>

                    </div>

                </div>

            </header>
        );
    }

    getControls = () => {

        var parentRef = this.props.self;

        return (
            <section className={css.controlsSection} ref="controls">

                <div className={css.controlsWrap}> 

                    <div className="project-filter">
                        <span onClick={this.props.filterProject.bind(parentRef,'all')} className={this.getLabelClass('all')}>All Projects</span>
                        <span onClick={this.props.filterProject.bind(parentRef,'starred')}  className={this.getLabelClass('starred')}>Starred</span>
                    </div>

                    <div className={css.projectControls}>
                        <SearchBar />
                        <RaisedButton
                            label="Create Project"
                            primary={true}
                            ref="showCreateProjectBtn"
                            onClick={this.props.showCreateProjectUI}
                        />
                    </div>

                </div>

            </section>
        );
    }
    
    render() {
        
        const progressStyle = {
            position : 'absolute',
            top : '40%',
            left : '40%'
        };

        var noProjects = (this.props.projects.length === 0) ? true : false;

        if (this.props.initDashboardStatus === 'loading') {
            return ( 
                <div className={css.root}>
                    {this.getHeader()}
                    {this.getControls()}
                    <CircularProgress style={progressStyle} ref="loading"/>
                </div>
            );
        }

        else if (this.props.initDashboardStatus === 'error') {

            const actions = [
                <FlatButton
                  label='Ok'
                  onTouchTap={this.props.handleOk}
                />           
            ];
            
            return ( 
                <div className={css.root}>
                    {this.getHeader()}
                    {this.getControls()}
                     <Dialog
                        title="Error"
                        actions={actions}
                        modal={false}
                        ref="errorDialog"
                        open={true}
                        onRequestClose={this.props.handleOk}
                    >
                        {this.props.error}
                    </Dialog>
                </div>
            );
        }

        else if (noProjects) {
            return (
                <div className={css.root}>
                    {this.getHeader()}
                    {this.getControls()}
                    <div className={css.noProjects}>No Projects for this user</div>
                    {this.props.displayCreateProjectUI ? this.getCreateProjectUI() : ''}
                </div>
            );
        }

        else {
            return (
               <div className={css.root}>

                   {this.getHeader()}
                   {this.getControls()}

                   <section className={css.projectsSection}>

                           <div className={css.projectList} ref="projectList">

                               {this.props.projects.map((project) => {

                                   var boundClick = this.props.openProject.bind(this,project.id);
                                   return (
                                       <div className={css.projectItem} key={project.id} onClick={boundClick}>
                                           <div className={css.itemCover}>
                                               <img src={project.coverUrl} />
                                           </div>
                                           <div className={cx('int-dashboard-project-item',css.itemName)}>{project.name}</div>
                                       </div>
                                   );
                               })}
                                      
                           </div>

                       }

                   </section>

                   {this.props.displayCreateProjectUI ? this.getCreateProjectUI() : ''}

               </div>
           ); 
        }

        
    }

}

DashboardView.propTypes = {
    projects :  React.PropTypes.array,
    orgs :  React.PropTypes.array,
    filterProject : React.PropTypes.func,
    self : React.PropTypes.object
};

module.exports = DashboardView;
