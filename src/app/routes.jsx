var React = require('react'); // eslint-disable-line no-unused-vars
var {Route,IndexRoute} = require('react-router');
var app = require('./app');

var routes = (
    <Route path='/' component={app}>
        <IndexRoute component={require('./view1/view1')}/>
        <Route path='view2' component={require('./view2/view2')}/>
    </Route>
);

module.exports = routes;
