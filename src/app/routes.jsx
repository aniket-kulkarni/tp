var React = require('react'); // eslint-disable-line no-unused-vars
var {Route,IndexRoute} = require('react-router');
var app = require('./app');

var routes = (
    <Route path='/' component={app}>
        <IndexRoute component={require('./dashboard/dashboard')}/>
        <Route path='signup/org' component={require('./authentication/org-signup.jsx')}/>
        <Route path='login' component={require('./authentication/login.jsx')}/>
        <Route path='invite/:id/project' component={require('./authentication/invite-project-member.jsx')}/>
        <Route path='read/:id' component={require('./read/read.jsx')}/>
        <Route path='read/:id/file/*' component={require('./read/read.jsx')}/>
        <Route path='invite/:id/project/interstitial' component={require('./authentication/invite-project-member-interstitial.jsx')}/>

        <Route path='project/:id' component={require('./project/project.jsx')}>
            <IndexRoute component={require('./project/content/content.jsx')}/>
            <Route path='file/*' component={require('./project/content/content.jsx')}/>
            <Route path='configure' component={require('./project/configure/configure.jsx')}>
                <IndexRoute component={require('./project/configure/strucutre.jsx')}/>
                <Route path='project' component={require('./project/configure/setup.jsx')}/>
            </Route>
            <Route path='theme' component={require('./project/theme/theme.jsx')}/>
            <Route path='review' component={require('./project/review/review.jsx')}/>
            <Route path='manage' component={require('./project/manage/manage.jsx')}/>
            <Route path='export' component={require('./project/export/export.jsx')}/>
        </Route>
        
        <Route path="*" component={require('./dashboard/dashboard')}/>
    </Route>
);

module.exports = routes;	
