var React = require('react');
var analytics = require('../../util/analytics.js');
var css = require('./configure.css');

class Configuration extends React.Component {

    constructor(props) {
        super(props);
        analytics.page(analytics.pageKeys.Project_Configure);
    }

    componentDidMount() {
        this.props.setSelectedView('configure',this);
    }

    setSave = (fn) => {
        this.save = fn;
    }

    render() {

        var props = {
            projectDetails : this.props.projectDetails,
            saveEnabled : this.props.saveEnabled,
            enableSave : this.props.enableSave,
            setSave : this.setSave
        };

        return (
            <div className={css.root}>
                <nav className={css.nav}>
                    I am Nav            
                </nav>
                {React.cloneElement(this.props.children,props)}
            </div>
        );
    }

}

module.exports = Configuration;
