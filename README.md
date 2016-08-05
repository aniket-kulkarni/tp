#Starter Kit for building Applications in React,React Router and Material UI

##Usage

 * This starter makes use of react,react-router and material-ui.
 * Hot reloading is enabled for both JS and CSS.
 * Makes use of mocha and enzyme for testing.
 * Linting is done via ESLINT.
 * CSS Modules is enabled. For more info goto https://github.com/css-modules/css-modules.

 * material-ui must be used to render the basic components unless there is a reason not to. formsy-material-ui must be used for validation of those components.

* The source is contained in src directory.
* Javascript (View, ViewModels, Actions, Services, Stores) must reside inside app folder of src.
* Global Styles must be kept in styles folder of src.
* View specific styles must be written in a specific view.css. It should use css modules.

##Config

Env related config must be kept in env-config.json file in the config directory. The corresponding config is generated in src/app/config/config.js whenever build commands are run.

##Recommendations

* The concept of container components and presentational components must be stricly followed.

* CommonJS require syntax used be used instead of es6 import. Though es6 will be a standard but lack of support in browser for import variables is the reason for usage of require currently.

##COMMANDS

For the first time setup type npm install. Linux users type sudo npm install.

1. npm start to run in development mode.
2. npm run build to run in production mode. The production files will reside in dist directory.
3. npm test for linting and testing.

##TODO

Add code coverage.
