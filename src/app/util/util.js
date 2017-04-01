var shortid = require('shortid');

function generateUUID() {
    return shortid.generate();  
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

module.exports = {
    generateUUID
};
