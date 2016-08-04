var React = require('react');
var routes = require('./routes');
var { Router, browserHistory } = require('react-router');

// If you use React Router, make this component
// render <Router> with your routes. Currently,
// only synchronous routes are hot reloaded, and
// you will see a warning from <Router> on every reload.
// You can ignore this warning. For details, see:
// https://github.com/reactjs/react-router/issues/2182


class App extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>{routes}</Router>
        );
    }
}

module.exports = App;
