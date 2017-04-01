var React = require('react');
var FontIcon = require('material-ui/lib/font-icon');
var css = require('./search-bar.css');


const iconStyles = {
    position : 'absolute',
    pointerEvents : 'none',
    fontSize : '20px',
    top : '7px',
    left : '4px'
};

class SearchBar extends React.Component {

    render() {

        const fontClass = `material-icons ${css.searchIcon}`;
        return (
            <div className={css.searchBar}>
                <FontIcon color="white" className={css.searchIcon} style={iconStyles} className={fontClass}>search</FontIcon>
                <input className={css.searchInput} type="text" placeholder="Search"/>
            </div>
        );
    }

}

module.exports = SearchBar;
