var alt = require('../alt');
var config = require('../config/config.js');
var constants = require('../config/constants.js');
var request = require('../util/request.js');
var analytics = require('../util/analytics.js');

class AuthActions {

    constructor() {
        this.generateActions('CLEAR_STATUS','FORCE_LOGOUT');
    }

    register(user) {

        return (dispatch) => {

            dispatch();

            var url = config.apiServerUrl + constants.REGISTER_URL;
            analytics.track(analytics.trackKeys.Organisation_Sign_Up_Started, {
                organizationName : user.org,
                emailId : user.email
            });
            request.makeRequest({
                method : 'POST',
                url,                
                data : {
                    emailId : user.email,
                    password : user.password,
                    organizationName : user.org
                }
            })
            .then((data) => {
                analytics.track(analytics.trackKeys.Organisation_Sign_Up_Successful, {
                    organizationName : user.org,
                    emailId : user.email
                });
                this.registerationSuccess(data);
            })
            .catch((rejection) => {
                analytics.track(analytics.trackKeys.Organisation_Sign_Up_Failed, {
                    organizationName : user.org,
                    emailId : user.email,
                    error : rejection
                });
                this.registerationFailed(rejection);
            });
            
        };
    }

    registerationSuccess(data) {
        return data;
    }

    registerationFailed(rejectionData) {
        return rejectionData;
    }

    login(user) {

        return (dispatch) => {

            dispatch();

            var url = config.apiServerUrl + constants.LOGIN_URL;
            analytics.track(analytics.trackKeys.Login_Started, {
                emailId : user.email
            });
            request.makeRequest({
                method : 'POST',
                url,                
                data : {
                    emailId : user.email,
                    password : user.password
                }                
            })
            .then((data) => {
                analytics.track(analytics.trackKeys.Login_Successful, {
                    emailId : user.email
                });
                this.loginSuccess(data);
            })
            .catch((rejection) => {

                analytics.track(analytics.trackKeys.Login_Failed, {
                    emailId : user.email,
                    error : rejection
                });

                this.loginFailed(rejection);
            });
            
        };
    }

    loginSuccess(data) {
        return data;
    }

    loginFailed(rejectionData) {
        return rejectionData;
    }

    logout() {

        return (dispatch) => {
            
            let UserStore = require('./user-store.js');
            let user = UserStore.getUser();

            dispatch();

            var url = config.apiServerUrl + constants.LOGOUT_URL;
            analytics.track(analytics.trackKeys.Logout_Started, {
                emailId : user.email
            });
            request.makeRequest({
                method : 'POST',
                url
            })
            .then(() => {
                analytics.track(analytics.trackKeys.Logout_Successful, {
                    emailId : user.email
                });
                this.logoutSuccess('success');
            })
            .catch((rejection) => {

                analytics.track(analytics.trackKeys.Logout_Failed, {
                    emailId : user.email,
                    error : rejection
                });

                this.logoutFailed(rejection);
            });
            
        };
    }

    logoutSuccess(data) {
        return data;
    }

    logoutFailed(rejectionData) {
        return rejectionData;
    }

    inviteProjectMember(id,user) {

        return (dispatch) => {

            dispatch();

            var url = config.apiServerUrl + constants.ACCEPT_PROJECT_MEMBER_INVITE_URL;
            url = url.replace(':id',id);

            analytics.track(analytics.trackKeys.InviteProjectMember_Started, {
                inviteId : id
            });

            var data = user ? user : {};

            request.makeRequest({
                method : 'POST',
                url,                
                data
            })
            .then((data) => {
                analytics.track(analytics.trackKeys.InviteProjectMember_Successful, {
                    inviteId : id
                });
                this.inviteProjectMemberSuccess(data);
            })
            .catch((rejection) => {

                analytics.track(analytics.trackKeys.InviteProjectMember_Failed, {
                    inviteId : id,
                    error : rejection
                });

                this.inviteProjectMemberFailed(rejection);
            });
            
        };
    }

    inviteProjectMemberSuccess(data) {
        return data;
    }

    inviteProjectMemberFailed(rejectionData) {
        return rejectionData;
    }
}

module.exports = alt.createActions(AuthActions);
