This starter makes use of react react-router and material-ui.

The concept of container components and presentational components must be stricly followed.

material-ui must be used to render the basic components unless there is a reason not to. formsy-material-ui must be used for validation of those components.

The testing is done using mocha and expect library. sinon can be used for mocks and stubs.
To test react components specifically enzyme must be used.

View specific styles must be written in a specific view.css. It should use css modules. For more info goto https://github.com/css-modules/css-modules.

CommonJS require syntax used be used instead of es6 import. Though es6 will be a standard but lack of support in browser for import variables is the reason for usage of require currently.

COMMANDS

For the first time setup type npm install. Linux users type sudo npm install.

npm start to run in development mode.
npm run build to run in production mode.
npm test for linting and testing.
