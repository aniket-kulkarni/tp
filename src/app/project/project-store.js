var alt = require('../alt');
var ProjectActions = require('./project-actions.js');

class ProjectStore {

    constructor() {

        this.projectDetails = null;
        this.organizationDetails = null;
        this.issues = [];

        this.status = null;
        this.error = null;
        this.dataLoaded = false;

        this.bindListeners({
            loadProjectDetailsSuccess : ProjectActions.LOAD_PROJECT_DETAILS_SUCCESS,
            loadProjectDetailsFailed : ProjectActions.LOAD_PROJECT_DETAILS_FAILED,
            clearState : ProjectActions.CLEAR_STATE,
            clearStatus : ProjectActions.CLEAR_STATUS,
            updateStructure : ProjectActions.UPDATE_PROJECT_STRUCTURE,
            updateIssues : ProjectActions.UPDATE_ISSUES
        });
    }

    loadProjectDetailsSuccess(response) {
        this.storeDetails(response);
    }

    loadProjectDetailsFailed(rejection) {
        this.dataLoaded = true;
        this.status = 'error';
        this.error = rejection.error.message;
    }

    storeDetails(details) {
        this.dataLoaded = true;
        this.projectDetails= details.projectDetails;
        this.organizationDetails= details.organizationDetails;
        this.issues= details.issues;
    }

    updateStructure(data) {
        var newStructure = {
            name : data.name,
            children : data.children
        };
        this.projectDetails.structure = newStructure;
    }

    updateIssues(newIssues) {
        this.issues = newIssues;
    }

    clearState() {
        this.projectDetails = null;
        this.organizationDetails = null;
        this.clearStatus();
    }

    clearStatus() {
        this.dataLoaded = false;
        this.status = null;
        this.error = null;   
    }
}

module.exports = alt.createStore(ProjectStore, 'ProjectStore');
