var config = require('../config/config.js');
var constants = require('../config/constants.js');
var request = require('../util/request.js');

function getReadData(id) {
    var url = config.apiServerUrl + constants.GET_READ_DATA_URL;
    url = url.replace(':id',id);

    return (
        request.makeRequest({
            method : 'GET',
            url
        })
    );
}

function getReadDataWithPin(id,data) {
    var url = config.apiServerUrl + constants.GET_READ_DATA_URL_WITH_PIN;
    url = url.replace(':id',id);

    return (
        request.makeRequest({
            method : 'POST',
            url,data
        })
    );
}

module.exports = {
    getReadData,getReadDataWithPin
};