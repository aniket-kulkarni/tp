var alt = require('../alt');
var AuthActions = require('./auth-actions');
var UserStore = require('./user-store.js');

class AuthStore {

    constructor() {

        this.regStatus = null;
        this.loginStatus = null;
        this.logoutStatus = null;
        this.inviteProjectMemberStatus = null;
        this.error = null;

        this.bindListeners({
            register : AuthActions.REGISTER,
            registerationSuccess : AuthActions.REGISTERATION_SUCCESS,
            registerationFailed : AuthActions.REGISTERATION_FAILED,
            login : AuthActions.LOGIN,
            loginSuccess : AuthActions.LOGIN_SUCCESS,
            loginFailed : AuthActions.LOGIN_FAILED,
            inviteProjectMember : AuthActions.INVITE_PROJECT_MEMBER,
            inviteProjectMemberSuccess : AuthActions.INVITE_PROJECT_MEMBER_SUCCESS,
            inviteProjectMemberFailed : AuthActions.INVITE_PROJECT_MEMBER_FAILED,
            logout : AuthActions.LOGOUT,
            logoutSuccess : AuthActions.LOGOUT_SUCCESS,
            logoutFailed : AuthActions.LOGOUT_FAILED,
            clearStatus : AuthActions.CLEAR_STATUS,
            forceLogout : AuthActions.FORCE_LOGOUT
        });
    }

    register() {
        this.regStatus = 'loading';
    }

    registerationSuccess() {
        this.regStatus = 'success';
    }

    registerationFailed(data) {
        this.regStatus = 'error';
        this.error = data.error.message;
    }

    inviteProjectMember() {
        this.inviteProjectMemberStatus = 'loading';
    }

    inviteProjectMemberSuccess() {
        this.inviteProjectMemberStatus = 'success';
    }

    inviteProjectMemberFailed(data) {
        this.inviteProjectMemberStatus = 'error';
        this.error = data.error.message;
    }

    login() {
        this.loginStatus = 'loading';
    }

    loginSuccess() {
        this.waitFor(UserStore);
        this.loginStatus = 'success';
    }

    loginFailed(data) {
        this.loginStatus = 'error';
        this.error = data.error.message;
    } 

    logout() {
        this.logoutStatus = 'loading';
    }

    logoutSuccess() {
        this.waitFor(UserStore);
        this.logoutStatus = 'success';
    }

    logoutFailed(data) {
        this.logoutStatus = 'error';
        this.error = data.error.message;
    }

    clearStatus() {
        this.regStatus = null;
        this.loginStatus = null;
        this.logoutStatus = null;
        this.inviteProjectMemberStatus = null;
        this.error = null;
    }

    forceLogout() {
        this.waitFor(UserStore);
        this.clearStatus();
    }
}

module.exports = alt.createStore(AuthStore, 'AuthStore');
