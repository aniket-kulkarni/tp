var React = require('react');
var DashboardView = require('./dashboard-view.jsx');
var analytics = require('../util/analytics.js');
var async = require('../util/async.js');
var DashboardActions = require('./dashboard-actions.js');
var DashboardStore = require('./dashboard-store.js');
var alt = require('../alt.js');
var AuthActions = require('../authentication/auth-actions.js');
var {hashHistory} = require('react-router');

class Dashboard extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            selectedFilter : 'all',
            showCreateProjectUI : false
        };
        
        Object.assign(this.state, DashboardStore.getState());

        analytics.page(analytics.pageKeys.User_Dashboard);
    }

    componentDidMount() {
        DashboardStore.listen(this.onChange);
        if (!(DashboardStore.getState().projects.length)) {
            async.then(() => { DashboardActions.initDashboard();});
        }
    }

    componentWillUnmount() {
        DashboardStore.unlisten(this.onChange);
    }

    openProject(id) {
        hashHistory.push(`/project/${id}`);
    }

    onChange = (state) => {
        
        this.setState(state);        

        if (state.createProjectStatus === 'success') {
            async.then(() => { this.clearCreateProjectStatus();});
        }

        else if (state.initDashboardStatus === 'success') {
            async.then(() => { 
                this.clearInitDashboardStatus();
            });
        }
    }

    showCreateProjectUI = () => {
        this.setState({
            displayCreateProjectUI : true
        });
    }

    hideCreateProjectUI = () => {
        this.setState({
            displayCreateProjectUI : false
        });

        if (this.state.createProjectStatus) {
            alt.dispatcher.dispatch({action : DashboardActions.CLEAR_STATUS});
        }
    }

    filterProject (filter) {
        this.setState({selectedFilter : filter});
    }

    createProject (model) {
        DashboardActions.createProject(model);    
    }
    
    logout() {
        AuthActions.logout();
    }

    handleOk = () => {
        this.clearInitDashboardStatus();
    }

    clearInitDashboardStatus = () => {
        this.setState({
            initDashboardStatus : null
        });
        
        alt.dispatcher.dispatch({action : DashboardActions.CLEAR_STATUS});
    }

    clearCreateProjectStatus = () => {
        this.setState({
            displayCreateProjectUI : false,
            createProjectStatus : null
        });

        alt.dispatcher.dispatch({action : DashboardActions.CLEAR_STATUS});
    }

    render() {
        return (
            <DashboardView self={this} {...this.state} 
                showCreateProjectUI={this.showCreateProjectUI}
                hideCreateProjectUI={this.hideCreateProjectUI}
                createProject={this.createProject}
                logout={this.logout}
                openProject={this.openProject}
                handleOk={this.handleOk}
                filterProject={this.filterProject} />
        );
    }

}

module.exports = Dashboard;
