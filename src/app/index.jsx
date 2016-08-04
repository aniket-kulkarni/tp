var { AppContainer } = require('react-hot-loader');
var React = require('react'); // eslint-disable-line no-unused-vars
var ReactDOM = require('react-dom');
var Load = require('./load');

var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

const rootEl = document.getElementById('root');
ReactDOM.render(
    <AppContainer>
        <Load />
    </AppContainer>,
    rootEl
);

if (module.hot) {
    module.hot.accept('./load', () => {
        // If you use Webpack 2 in ES modules mode, you can
        // use <Load /> here rather than require() a <NextLoad />.
        const NextLoad = require('./load');
        ReactDOM.render(
            <AppContainer>
                <NextLoad />
            </AppContainer>,
            rootEl
        );
    });
}
