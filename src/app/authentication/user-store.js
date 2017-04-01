var alt = require('../alt');
var AuthActions = require('./auth-actions');

class UserStore {

    constructor() {

        var userData = localStorage.getItem('userData');

        if (userData) {
            try {
                userData = JSON.parse(userData);    
            } catch (e) {
                console.log(e.message); // eslint-disable-line no-console
                userData = {};
            }    
        }
        else {
            userData = {};
        }

        this.user = userData.user || null;
        this.token = userData.token || null;
        this.session = userData.session || null;

        this.exportPublicMethods({
            getUser: this.getUser,
            getUserId: this.getUserId,
            getUserEmail: this.getUserEmail,
            isAuthenticated: this.isAuthenticated,
            getToken: this.getToken
        });

        this.bindListeners({
            setData : AuthActions.LOGIN_SUCCESS,
            removeData : AuthActions.LOGOUT_SUCCESS,
            forceLogout : AuthActions.FORCE_LOGOUT
        });
    }

    setData(data) {
    
        var userData = {user : data.user, token : data.token,session : data.session};
        userData = JSON.stringify(userData);

        localStorage.setItem('userData',userData);

        this.user = data.user;
        this.token = data.token;
        this.session = data.session;

    }  

    forceLogout() {
        this.removeData();
    } 

    removeData() {

        localStorage.removeItem('userData');

        this.user = null;
        this.token = null;
        this.session = null;

    }

    isAuthenticated() {
        return (this.state.token) ? true : false;
    }

    getToken() {
        return this.state.token;
    }

    getUser() {
        return this.state.user;
    }

    getUserId() {
        return this.state.user._id;
    }

    getUserEmail() {
        return this.state.user.email;
    }
}

module.exports = alt.createStore(UserStore, 'UserStore');
