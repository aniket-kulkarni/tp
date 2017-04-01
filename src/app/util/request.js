var constants = require('../config/constants.js');
var alt = require('../alt.js');

var makeRequest = function(req) {

    var AuthActions = require('../authentication/auth-actions.js');
    var UserStore = require('../authentication/user-store.js');
    var defaultContentType = 'application/json';
    var defaultAcceptType = 'application/json';

    var method = req.method,
        url = req.url,
        headers = req.headers || {},
        data = req.data || null,
        body = ''; 

    if (!(headers['Content-Type'])) {
        headers['Content-Type'] = defaultContentType; 
    }

    if (headers['Content-Type'] == 'application/json' && data) {
        body = JSON.stringify(data);
    }

    if (UserStore.getToken()) {
        headers['token'] = UserStore.getToken();
    }

    var accept = headers['Accept'] || defaultAcceptType,
        acceptJSON = false;

    if (accept && accept.includes('application/json')) {
        acceptJSON = true;
    }

    return new Promise(function(resolve,reject) {

        var params = {method,headers};
        if (body.length) {
            params.body = body;
        }

        fetch(url,params)
        .then((response) => {

            let status = response.status;

            if (status === 204) {
                resolve();
            }
                
            else if (status >= 200 && status < 300) {

                if (acceptJSON) {
                    response.json().then((data) => {
                        resolve(data);
                    })
                    .catch((err) => {
                        resolve(err);
                    });
                } else {
                    response.text().then((data) => {
                        resolve(data);
                    })
                    .catch((err) => {
                        resolve(err);
                    });
                }
            }
            else {

                response.json().then((error) => {
                    
                    if (status === 401 && error.invalid_token === true) {
                        alt.dispatcher.dispatch({action : AuthActions.FORCE_LOGOUT});
                    }
                    else {
                        if (!error.message) {
                            error.message = constants.SERVER_ERROR;
                        }
                        reject({status,error});    
                    }
                    
                })
                .catch(() => {
                    var error = {message : constants.SERVER_ERROR};
                    reject({status,error});
                });
            }

        })
        .catch(() => {
            var error = {
                message : constants.SERVER_CONNECTION_ERROR
            };
            var status = null;
            reject({status,error});
        });
    });

};

module.exports = {
    makeRequest
};
