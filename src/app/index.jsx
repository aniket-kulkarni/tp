var React = require('react'); // eslint-disable-line no-unused-vars
var ReactDOM = require('react-dom');
var routes = require('./routes');
require('script!../non-npm-lib/zepto.js');
require('script!../non-npm-lib/fx.js');
var { Router, hashHistory } = require('react-router');

var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

ReactDOM.render(<Router history={hashHistory}>{routes}</Router> , document.getElementById('app'));
