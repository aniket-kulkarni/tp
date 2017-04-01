var config = require('../config/config.js');
var constants = require('../config/constants.js');
var request = require('../util/request.js');
var analytics = require('../util/analytics.js');

function sendProjectMembersInvitation(id,emails) {
    
    var members = emails.map(email => { return {email : email}; });
    
    var url = config.apiServerUrl + constants.PROJECT_MEMBER_INVITE_URL;
    url = url.replace(':id',id);

    analytics.track(analytics.trackKeys.Inviting_Project_Members_Started, {
        projectId : id,
        members : members
    });

    return new Promise(function(resolve,reject) {
        request.makeRequest({
            method : 'POST',
            url,           
            data : {
                members
            }
        })
        .then((data) => {
            analytics.track(analytics.trackKeys.Inviting_Project_Members_Successful, {
                projectId : id,
                members : members
            });
            resolve(data);
        })
        .catch((rejection) => {
            analytics.track(analytics.trackKeys.Inviting_Project_Members_Failed, {
                projectId : id,
                members : members,
                error : rejection
            });
            reject(rejection);
        });
    });
}


function addNewMembers(id,membersToBeAdded) {
    
    var members = membersToBeAdded.map(member => { return {id : member.id}; });
    
    var url = config.apiServerUrl + constants.ADD_PROJECT_MEMBER_URL;
    url = url.replace(':id',id);

    analytics.track(analytics.trackKeys.Add_Project_Members_Started, {
        projectId : id,
        members : members
    });

    return new Promise(function(resolve,reject) {
        request.makeRequest({
            method : 'POST',
            url,           
            data : {
                users : members
            }
        })
        .then((data) => {
            analytics.track(analytics.trackKeys.Add_Project_Members_Successful, {
                projectId : id,
                members : members
            });
            resolve(data);
        })
        .catch((rejection) => {
            analytics.track(analytics.trackKeys.Add_Project_Members_Failed, {
                projectId : id,
                members : members,
                error : rejection
            });
            reject(rejection);
        });
    });
}

function addNewPage(id,fileDetails,pageTitle) {

    var url = config.apiServerUrl + constants.ADD_NEW_FILE_TO_PROJECT;
    url = url.replace(':id',id);

    var fileName = _getFileName(fileDetails,pageTitle);

    if (!fileName) {
        alert('File already exists');  // eslint-disable-line no-alert
        return;
    }

    var filePath = `${fileDetails.chapter.name}/${fileName}`;
    url = url.replace(':filePath',filePath);

    analytics.track(analytics.trackKeys.Add_New_File_To_Project_Started, {
        projectId : id,
        fileDetails : fileDetails
    });

    return new Promise(function(resolve,reject) {
        request.makeRequest({
            method : 'POST',
            url,           
            data : {
                title : pageTitle,
                index : (fileDetails.fileIndex + 1)
            }
        })
        .then((data) => {
            analytics.track(analytics.trackKeys.Add_New_File_To_Project_Successful, {
                projectId : id,
                fileDetails : fileDetails
            });
            resolve(data);
        })
        .catch((rejection) => {
            analytics.track(analytics.trackKeys.Add_New_File_To_Project_Failed, {
                projectId : id,
                fileDetails : fileDetails,
                error : rejection
            });
            reject(rejection);
        });
    });

}

function renamePage(id,fileDetails,newName) {

    var url = config.apiServerUrl + constants.RENAME_FILE_URL;
    url = url.replace(':id',id);

    var filePath = `${fileDetails.chapter.name}/${fileDetails.file.fileName}`;
    url = url.replace(':filePath',filePath);

    analytics.track(analytics.trackKeys.Rename_File_Started, {
        projectId : id,
        fileDetails : fileDetails
    });

    return new Promise(function(resolve,reject) {
        request.makeRequest({
            method : 'POST',
            url,           
            data : {
                newName
            }
        })
        .then((data) => {
            analytics.track(analytics.trackKeys.Rename_File_Successful, {
                projectId : id,
                fileDetails : fileDetails
            });
            resolve(data);
        })
        .catch((rejection) => {
            analytics.track(analytics.trackKeys.Rename_File_Failed, {
                projectId : id,
                fileDetails : fileDetails,
                error : rejection
            });
            reject(rejection);
        });
    });

}

function deletePage(id,fileDetails) {

    var url = config.apiServerUrl + constants.DELETE_FILE_URL;
    url = url.replace(':id',id);

    var filePath = `${fileDetails.chapter.name}/${fileDetails.file.fileName}`;
    url = url.replace(':filePath',filePath);

    analytics.track(analytics.trackKeys.Delete_File_Started, {
        projectId : id,
        fileDetails : fileDetails
    });

    return new Promise(function(resolve,reject) {
        request.makeRequest({
            method : 'DELETE',
            url           
        })
        .then((data) => {
            analytics.track(analytics.trackKeys.Delete_File_Successful, {
                projectId : id,
                fileDetails : fileDetails
            });
            resolve(data);
        })
        .catch((rejection) => {
            analytics.track(analytics.trackKeys.Delete_File_Failed, {
                projectId : id,
                fileDetails : fileDetails,
                error : rejection
            });
            reject(rejection);
        });
    });

}

function getFileContent(id,filePath) {

    var url = config.apiServerUrl + constants.GET_FILE_CONTENT_URL;
    url = url.replace(':id',id);

    url = url.replace(':filePath',filePath);

    return (
        request.makeRequest({
            method : 'GET',
            url,
            headers : {
                'Accept' : 'text/plain'
            }
        })
    );
}

function saveFileContent(id,filePath,content) {

    var url = config.apiServerUrl + constants.SAVE_FILE_CONTENT_URL;
    url = url.replace(':id',id);

    url = url.replace(':filePath',filePath);

    return (
        request.makeRequest({
            method : 'PUT',
            url,
            data : {
                content
            },
            headers : {
                'Accept' : 'text/plain'
            }
        })
    );
}

function saveIssues(id,data) {

    var url = config.apiServerUrl + constants.SAVE_ISSUES_URL;
    url = url.replace(':id',id);

    return (
        request.makeRequest({
            method : 'POST',
            url,
            data 
        })
    );
}

function updateStrucutre(id,reqBody) {

    var url = config.apiServerUrl + constants.UPDATE_STRUCTURE_URL;
    url = url.replace(':id',id);

    return (
        request.makeRequest({
            method : 'PUT',
            url,
            data : reqBody
        })
    );
}

function getExportData(id) {
    var url = config.apiServerUrl + constants.GET_EXPORT_DATA_URL;
    url = url.replace(':id',id);

    return (
        request.makeRequest({
            method : 'GET',
            url
        })
    );
}

function exportProject(id) {
    var url = config.apiServerUrl + constants.PROJECT_EXPORT_URL;
                
    url = url.replace(':id',id);

    return (
        request.makeRequest({
            method : 'POST',
            url
        })
    );
}

function exportWebProject(id,data) {
    var url = config.apiServerUrl + constants.PROJECT_WEB_EXPORT_URL;
                
    url = url.replace(':id',id);

    return (
        request.makeRequest({
            method : 'POST',
            url,data
        })
    );
}

function _getFileName(fileDetails,title) {
    
    var nameWithoutExt = title.split(' ').join('-');
    var tempName = `${nameWithoutExt}.html`;
    var fileNameIndex = 1;
    var exists = _isFileNameExists(tempName,fileDetails.chapter.children);

    if (exists) {

        while (exists) {

            tempName = `${nameWithoutExt}-${fileNameIndex}.html`;
            exists = _isFileNameExists(tempName,fileDetails.chapter.children);
                                                
            if (exists) {
                fileNameIndex++;
            }

            if (fileNameIndex > 100) {
                break;
            }
        }

        if (exists) {
            return null;
        } else {
            return tempName;
        }

    } else {
        return tempName;
    }

}

function _isFileNameExists(name,files) {

    var exists = false;

    files.every((file) => {

        if (file.fileName === name) {
            exists = true;
            return false;
        } else {
            return true;
        }
    });

    return exists;
}

module.exports = {
    sendProjectMembersInvitation,addNewMembers,addNewPage,renamePage,
    deletePage,getFileContent,saveFileContent, getExportData, exportProject, updateStrucutre,saveIssues,exportWebProject
};