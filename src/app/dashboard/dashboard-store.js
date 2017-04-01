var alt = require('../alt');
var DashboardActions = require('./dashboard-actions');
var AuthActions = require('../authentication/auth-actions.js');

class DashboardStore {

    constructor() {

        
        this.organizations = [];
        this.projects = [];

        this.initDashboardStatus = null;
        this.createProjectStatus = null;
        this.error = null;

        this.exportPublicMethods({
            getOrganizations : this.getOrganizations
        });

        this.bindListeners({
            initDashboard : DashboardActions.INIT_DASHBOARD,
            handleInitDashboardSuccess : DashboardActions.INIT_DASHBOARD_SUCCESS,
            handleInitDashboardFailed : DashboardActions.INIT_DASHBOARD_FAILED,
            createProject : DashboardActions.CREATE_PROJECT,
            handleCreateProjectSuccess : DashboardActions.CREATE_PROJECT_SUCCESS,
            handleCreateProjectFailed : DashboardActions.CREATE_PROJECT_FAILED,
            clearStatus : DashboardActions.CLEAR_STATUS,
            clearState : AuthActions.CLEAR_STATUS,
            forceLogout : AuthActions.FORCE_LOGOUT
        });
    }

    initDashboard() {
        this.initDashboardStatus = 'loading';
    }
    
    handleInitDashboardSuccess(data) {
        this.initDashboardStatus = 'success';
        this.organizations = data.organizations;
        this.projects = data.projects;
    }

    handleInitDashboardFailed(rejection) {
        this.initDashboardStatus = 'error';
        this.error = rejection.error.message;
    }

    clearStatus() {
        this.initDashboardStatus = null;
        this.createProjectStatus = null;
        this.error = null;
    }

    getOrganizations() {
        return this.state.organizations;
    }

    createProject() {
        this.createProjectStatus = 'loading';
    }

    handleCreateProjectSuccess(project) {
        this.createProjectStatus = 'success';
        this.projects.push(project);
    }

    handleCreateProjectFailed(data) {
        this.createProjectStatus = 'error';
        this.error = data.error.message;
    }

    clearState() {
        this.organizations = [];
        this.projects = [];
        this.clearStatus();
    }

    forceLogout() {
        this.clearState();
    }
    
}

module.exports = alt.createStore(DashboardStore, 'DashboardStore');
