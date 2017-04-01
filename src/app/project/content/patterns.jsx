var React = require('react');
var css = require('./patterns.css');

class Patterns extends React.Component {

    constructor(props) {
        super(props);
    }

    handleDragStart = (e) => {

        var target = e.target;
        var groupName = target.dataset.group;
        var patternName = target.dataset.pattern;

        var groupData = (this.props.patterns.filter((pattern) => {
            if (pattern.groupName === groupName) {
                return true;
            } else {
                return false;
            }
        }))[0];

        var patternData = (groupData.patterns.filter((pattern) => {
            if (pattern.name === patternName) {
                return true;
            } else {
                return false;
            }
        }))[0];

        e.dataTransfer.setData('data', JSON.stringify(patternData));
        this.props.setDragFlag(true);
    }

    render() {
        return (
            <section className={css.root}>
                <div className={css.header}>
                   Patterns      
                </div>

               <div className={css.content}>
                    
                    <div className={css.patternsWrap}>
                        

                        {this.props.patterns.map((patternGroup) => {

                            return (
                                <div key={patternGroup.groupName} className={css.patternGroup}>

                                    <div className={css.groupName}>
                                        {patternGroup.groupName}
                                    </div>

                                    <ul className={css.patternList}>

                                    {patternGroup.patterns.map((pattern) => {
                                        return (
                                            
                                            <li data-group={patternGroup.groupName}  data-pattern={pattern.name}
                                                draggable="true" onDragStart={this.handleDragStart} key={patternGroup.groupName + '-' + pattern.name} className={css.patternItem}>
                                                <div className={css.icon}> </div>
                                                <div className={css.patternTitle}>{pattern.name}</div>
                                            </li>
                                            
                                        );
                                    })}
                                    
                                    </ul>

                                </div>
                            );
                        })}

                    </div>

               </div>
            </section>
        );
    }

}

module.exports = Patterns;
