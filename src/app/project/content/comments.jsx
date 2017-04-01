var React = require('react');
var css = require('./comments.css');
var cx = require('classnames');
var {statusText,statusColors} = require('./issueConfig.js');

var RaisedButton = require('material-ui/lib/raised-button');
    
class Comments extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log('Mounted');
    }

    componentWillUnmount() {
        console.log('Unmounted');
    }

    addNewComment = () => {

        var {author,filePath,deviceWidthValue} = this.props;

        var newIssue = {
            author : author.id,
            new : true,
            edit : true,
            status : 1,
            assignee : null,
            filePath : filePath,
            position : {
                left : '50px',
                top : '50px'
            },
            deviceMode : deviceWidthValue,
            comments : [
                {
                    author : author.id,
                    text : '',
                    type : 'comment',
                    edit : true,
                    new : true,
                    done : false
                }
            ]
        };

        this.props.addNewIssue(newIssue);

    }

    toggleStatus = (e) => {

        var target = e.currentTarget;
        var status = parseInt(target.dataset.status, 10);

        this.props.toggleIssueStatus(status);
    }

    toggleAssignee = (e) => {

        var target = e.currentTarget;
        var assignee = target.dataset.assignee;

        this.props.toggleIssueAssignees(assignee);
    }


    render() {

        const buttonStyle = {
            labelStyle : {
                textTransform : 'none'
            },
            style : {
                height : '28px'
            }
        };

        var stateBoard = {};
        var statusTextValMap = {};
        var assigneeBoard = {};
        var membersIdNameMap = {};

        var {issues,projectMembers,hideStatus,hideAssignees} = this.props;

        projectMembers.forEach((member) => {
            membersIdNameMap[member.id] = member.email;
        });

        issues.forEach((issue) => {
            let status = issue.status;
            let text = statusText[status].toLowerCase();
            statusTextValMap[text] = status;
            let assignee = issue.assignee ? issue.assignee : 'unassigned';

            if (stateBoard[text]) {
                stateBoard[text] = stateBoard[text] + 1;
            } else {
                stateBoard[text] = 1;
            }

            if (assigneeBoard[assignee]) {
                assigneeBoard[assignee] = assigneeBoard[assignee] + 1;
            } else {
                assigneeBoard[assignee] = 1;
            }
        });

        return (
            <section className={css.root}>

                <div className={css.header}>
                    <div className={css.headerText}> Comments </div>
                    <div className={css.headerActions}>
                        <RaisedButton
                            ref="newComment"
                            label="New Comment"
                            {...buttonStyle}
                            onClick={this.addNewComment}
                        />
                    </div>      
                </div>

                <div className={css.content}>
                    { (issues.length > 0) && 
                        <section className={css.statusBoard}>

                        <div className={css.stateBoard}>
                            <header className={css.boardHeader}>States</header>      
                            <div className={css.stateBoardList}>
                                {                                    
                                    Object.keys(stateBoard).map((key, index) => {
                                        
                                        var statusVal = statusTextValMap[key];
                                        var color = statusColors[statusVal];

                                        var style = {
                                            borderColor : color,
                                            color : color
                                        };

                                        return (
                                            <div style={style} onClick={this.toggleStatus}
                                                data-status={statusVal} key={index} 
                                                className={cx(css.boardItem,css.stateBoardItem,{[css.minimizedState] : hideStatus[statusVal] } )}>
                                                <span className={css.text}>{key}</span>
                                                <span className={css.count}>{stateBoard[key]}</span>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>

                        <div className={css.assigneeBoard}>
                            <header className={css.boardHeader}>Assignees</header>        
                            <div className={css.assigneeBoardList}>
                                {
                                    Object.keys(assigneeBoard).map((key, index) => {
                                        var text = (key === 'unassigned') ? key : membersIdNameMap[key];
                                        var id = (key === 'unassigned') ? key : key;
                                        return (
                                            <div key={index} onClick={this.toggleAssignee} data-assignee={id}  
                                                className={cx(css.boardItem,css.assigneeBoardItem,{[css.minimizedState] : hideAssignees[id] } )}>
                                                <span className={css.text}>{text}</span>
                                                <span className={css.count}>{assigneeBoard[key]}</span>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                        </section>
                    }
                </div>
            </section>
        );
    }

}

module.exports = Comments;
