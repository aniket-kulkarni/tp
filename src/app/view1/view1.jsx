var React = require('react');
var css = require('./view1.css');
var {Link} = require('react-router');

class View1 extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={css.root}>
                <header className={css.header}>
                    <Link to="/view2"> View2 </Link>
                </header>
                <div> I am View1 </div>
            </div>
        );
    }

}

module.exports = View1;
