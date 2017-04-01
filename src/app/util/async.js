var then = function (cb,timeout) {
    timeout = timeout || 0;
    setTimeout(cb,timeout);
    return {then  : then};
};

module.exports = {then};