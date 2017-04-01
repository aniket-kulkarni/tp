var alt = require('../alt');
var config = require('../config/config.js');
var constants = require('../config/constants.js');
var request = require('../util/request.js');
var analytics = require('../util/analytics.js');

class DashboardActions {

    constructor() {
        this.generateActions('CLEAR_STATUS');
    }

    initDashboard() {

        return (dispatch) => {

            dispatch();

            var url = config.apiServerUrl + constants.INIT_DASHBOARD_URL;

            request.makeRequest({
                method : 'GET',
                url
            })
            .then((data) => {
                this.initDashboardSuccess(data);
            })
            .catch((rejection) => {
                this.initDashboardFailed(rejection);
            });
            
        };
        
    }

    initDashboardSuccess(response) {
        var transformedResponse = transformInitDashboardResponse(response);
        return transformedResponse;
    }

    initDashboardFailed(rejectionData) {
        return rejectionData;
    }

    
    createProject(model) {
        
        return (dispatch) => {

            analytics.track(analytics.trackKeys.Create_Project_Started, {
                name : model.projectName,
                orgId : model.organizationId
            });

            dispatch();

            var url = config.apiServerUrl + constants.CREATE_PROJECT_URL;

            request.makeRequest({
                method : 'POST',
                url,                
                data : {
                    name : model.projectName,
                    orgId : model.organizationId
                }
            })
            .then((data) => {
                analytics.track(analytics.trackKeys.Create_Project_Successful, {
                    name : model.projectName,
                    orgId : model.organizationId
                });

                this.createProjectSuccess(data);
            })
            .catch((rejection) => {
                analytics.track(analytics.trackKeys.Create_Project_Failed, {
                    name : model.projectName,
                    orgId : model.organizationId
                });

                this.createProjectFailed(rejection);
            });
            
        };
    }

    createProjectSuccess(data) {
        return transformCreateProjectResponse(data);
    }

    createProjectFailed(rejectionData) {
        return rejectionData;
    }
}

function transformInitDashboardResponse(response) {
    
    var transformedResponse = {};

    transformedResponse.organizations = response.organizations.map((org) => {

        var name = org.name,
            id = org._id;

        var members = org.members.map((member) => {
            return {id : member.user._id,email : member.user.email};
        });
        
        return {name,id,members};
    });

    transformedResponse.projects = response.projects.map((project) => {

        let returnVal = {
            name : project.metadata.name, 
            id : project._id,
            organizationId : project.organization
        };

        if (!project.coverUrl) {
            returnVal.coverUrl = constants.DEFAULT_PROJECT_COVER_URL;
        }
        return returnVal;
    });

    return transformedResponse;
}

function transformCreateProjectResponse(response) {
    
    var transformedResponse = {};
    transformedResponse.id = response._id;
    transformedResponse.name = response.metadata.name;
    transformedResponse.coverUrl = constants.DEFAULT_PROJECT_COVER_URL;
    return transformedResponse;
}

module.exports = alt.createActions(DashboardActions);
