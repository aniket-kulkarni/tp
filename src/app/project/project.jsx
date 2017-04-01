var React = require('react');
var Navigation = require('./navigation.jsx');
var {hashHistory} = require('react-router');
var ProjectStore = require('./project-store.js');
var ProjectActions = require('./project-actions.js');
var AuthActions = require('../authentication/auth-actions.js');
var css = require('./project.css');
var analytics = require('../util/analytics.js');
var alt = require('../alt.js');
var CircularProgress = require('material-ui/lib/circular-progress');
var async = require('../util/async.js');

class Project extends React.Component {

    constructor(props) {

        super(props);
        var projectId = this.props.params.id;
        this.state = {
            saveEnabled : false,
            childRef : null
        };
        ProjectActions.loadProjectDetails(projectId);
    }

    componentDidMount() {
        ProjectStore.listen(this.onChange);
    }

    onChange = (state) => {
        this.setState(state);
    }

    setSelectedView = (view,childRef) => {
        childRef = childRef || null;
        this.setState({selectedView : view,childRef});
    }

    enableSave = (enable) => {
        this.setState({
            saveEnabled : enable
        });
    }

    selectView = (selectedView,url) => {

        if (this.state.selectedView === selectedView) {
            return;
        }

        url = url.replace(':id',this.state.projectDetails.id);

        analytics.track(analytics.trackKeys[`${selectedView}_view_clicked`], {
            projectId : this.state.projectDetails.id
        });

        hashHistory.push(url);

    }

    save = () => {
        var save = this.refs.childComponent.save || this.state.childRef.save; 
        // To Handle React Router With Router. May be the wrong way but currently I got this as the only way.
        // Author : Aniket
        save();
    }

    logout() {
        AuthActions.logout();
    }

    componentWillUnmount() {
        ProjectStore.unlisten(this.onChange);
        async.then(() => { 
            alt.dispatcher.dispatch({action : ProjectActions.CLEAR_STATE});
        });
    }

    render() {


        var props = {
            setSelectedView : this.setSelectedView,
            enableSave : this.enableSave,
            hideEditor : this.hideEditor,
            ref : 'childComponent'
        };
        
        Object.assign(props,this.state);

        if (!props.dataLoaded) {
            let progressStyle = {
                position : 'absolute',
                top : '40%',
                left : '40%'
            };
            return (
                <CircularProgress style={progressStyle}/>
            );
        }
        else {
            return (
                <div className={css.root}>
                   <Navigation {...this.state} save={this.save} selectView={this.selectView} logout={this.logout}/>
                   {React.cloneElement(this.props.children,props)}
                </div>
           ); 
        }
    }

}

module.exports = Project;
