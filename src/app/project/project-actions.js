var alt = require('../alt');
var config = require('../config/config.js');
var constants = require('../config/constants.js');
var request = require('../util/request.js');

class ProjectActions {

    constructor() {
        this.generateActions('CLEAR_STATE','CLEAR_STATUS','UPDATE_PROJECT_STRUCTURE','UPDATE_ISSUES');
    }

    loadProjectDetails(id) {

        return (dispatch) => {

            dispatch();

            var url = config.apiServerUrl + constants.GET_PROJECT_DETAILS_URL;
            url = url.replace(':id',id);

            request.makeRequest({
                method : 'GET',
                url
            })
            .then((data) => {
                this.loadProjectDetailsSuccess(data);
            })
            .catch((rejection) => {
                this.loadProjectDetailsFailed(rejection);
            });
            
        };
        
    }

    loadProjectDetailsSuccess(response) {
        var transformedResponse = transformloadProjectDetailsResponse(response);
        return transformedResponse;
    }

    loadProjectDetailsFailed(rejectionData) {
        return rejectionData;
    }

}

function transformloadProjectDetailsResponse(response) {
    
    var transformedResponse = {};

    var name = response.organization.name,
        id = response.organization._id;

    var members = response.organization.members.map((member) => {
        return {id : member.user._id,email : member.user.email,permissions : member.permissions};
    });

    transformedResponse.organizationDetails = {
        name,id,members
    };

    var projectMembers = response.members.map((member) => {
        return {
            id : member.user._id,email : member.user.email
        };
    });

    var coverUrl =  (response.metadata.coverUrl) ?  
            response.metadata.coverUrl : constants.DEFAULT_PROJECT_COVER_URL;

    transformedResponse.projectDetails = {
        name : response.metadata.name, 
        structure : response.metadata.structure, 
        id : response._id,
        members : projectMembers,
        coverUrl,
        content : {
            patterns : response.patterns
        }
    };

    transformedResponse.issues = response.issues || [];

    return transformedResponse;

}

module.exports = alt.createActions(ProjectActions);
