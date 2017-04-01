var React = require('react');
var css = require('./issue.css');
var cx = require('classnames');

var FontIcon = require('material-ui/lib/font-icon');

var {statusColors,statusText} = require('./issueConfig.js');

class Issue extends React.Component {

    constructor(props) {
        super(props);
        this.temp = {};
    }

    componentDidMount() {
    }

    updateComment = (e) => {

        var target = e.target;
        var textarea = $(target).closest(`.${css.editCommentWrap}`).find('textarea')[0];
        var val = textarea.value; 
        var issueIndex = parseInt(textarea.dataset.issueindex),
            commentIndex = parseInt(textarea.dataset.commentindex);

        this.props.updateComment(issueIndex,commentIndex,val);
    }

    cancelUpdateComment = (e) => {

        var target = e.target;
        var textarea = $(target).closest(`.${css.editCommentWrap}`).find('textarea')[0];
        var issueIndex = parseInt(textarea.dataset.issueindex),
            commentIndex = parseInt(textarea.dataset.commentindex);

        this.props.updateComment(issueIndex,commentIndex);
    }

    adjustHeight(e) {
        e.target.style.height = (e.target.scrollHeight) + 'px';
    }

    toggleVisibilty = (e) => {

        var target = e.currentTarget;
        var issueIndex = parseInt(target.dataset.issueindex);
        this.props.toggleVisibilty(issueIndex);
       
    }

    minimize = (e) => {

        var target = e.currentTarget;
        var issueIndex = parseInt(target.dataset.issueindex);
        this.props.minimize(issueIndex);
        
    }

    reply = (e) => {
        var target = e.currentTarget;
        var issueIndex = parseInt(target.dataset.issueindex);

        this.props.reply(issueIndex);
    }

    changeStatus = (e) => {

        var target = e.target;
        var issueIndex = parseInt(target.dataset.issueindex);
        var value = parseInt(target.value);
        var optionText = target.selectedOptions[0].textContent;

        this.props.changeStatus(issueIndex,value,optionText);
    }

    changeAssignee = (e) => {

        var target = e.target;
        var issueIndex = parseInt(target.dataset.issueindex);
        var value = (target.value == 0) ? null : target.value;
        this.props.changeAssignee(issueIndex,value);
    }

    startDrag = (e) => {
        var target = e.target;
        this.temp.oldPageX = e.pageX;
        this.temp.oldPageY = e.pageY;
        this.temp.oldLeft = parseInt(target.dataset.left);
        this.temp.oldTop = parseInt(target.dataset.top);

        $(document).on('mousemove', this.handleMouseMoveForDrag);
        $(document).on('mouseup', this.handleMouseUpForDrag);
        $('#content-root').addClass('issueDrag');
    }

    handleMouseMoveForDrag = (e) => {
        var leftDelta = e.pageX - this.temp.oldPageX;
        var topDelta = e.pageY - this.temp.oldPageY;

        var newLeft = this.temp.oldLeft + leftDelta;
        var newTop = this.temp.oldTop + topDelta;

        $(this.refs.root).css({
            left : newLeft,
            top : newTop
        });
    }

    handleMouseUpForDrag = (e) => {

        $('#content-root').removeClass('issueDrag');
        var leftDelta = e.pageX - this.temp.oldPageX;
        var topDelta = e.pageY - this.temp.oldPageY;

        var newLeft = this.temp.oldLeft + leftDelta + 'px';
        var newTop = this.temp.oldTop + topDelta + 'px';

        var target = this.refs.root;
        var issueIndex = parseInt(target.dataset.issueindex);

        this.props.updateIssuePosition(issueIndex,newLeft,newTop);

        $(document).off('mousemove', this.handleMouseMoveForDrag);
        $(document).off('mouseup', this.handleMouseUpForDrag);
    }

    enableEditing = (e) => {
        var target = e.currentTarget;
        var {issueindex,commentindex} = target.dataset;
        this.props.enableEditing(issueindex,commentindex);
    }

    render() {


        var {issue,projectMembers,unassigned,minimized,issueIndex} = this.props;
        var issueColor = statusColors[issue.status];

        return (
            <div style={{top : issue.position.top,left : issue.position.left}}    
                className={cx(css.root,{[css.minimized] : minimized,[css.edit] : issue.edit})} 
                data-issueindex={issueIndex} ref="root">

                <div>
                    <FontIcon data-issueindex={issueIndex} onClick={this.toggleVisibilty} 
                        className={cx('material-icons',css.commentIcon)} color={issueColor}>mode_comment</FontIcon>
                </div>

                <div className={css.issueWrap} style={{borderColor : issueColor}}>
                    <header className={css.header}>
                        <div> 
                            <FontIcon style={{fontSize : '20px'}} data-issueindex={issueIndex} onClick={this.minimize} className={cx('material-icons',css.minimize,css.headerIcon)} color='grey'>remove</FontIcon>
                            <FontIcon style={{fontSize : '20px'}} data-issueindex={issueIndex} onClick={this.reply} className={cx('material-icons',css.reply,css.headerIcon)} color='grey'>reply</FontIcon>
                        </div>
                        <div className={css.draggable} data-left={issue.position.left} data-top={issue.position.top} 
                            onMouseDown={this.startDrag} ref="draggable"></div>

                    </header>

                    <div className={css.comments}>
                        {issue.comments.map((comment,commentIndex) => {
                            if (comment.edit) {
                                return (
                                    <div key={commentIndex} className={css.editCommentWrap} data-commentindex={commentIndex}>
                                        <textarea data-issueindex={issueIndex} data-commentindex={commentIndex} 
                                            className={css.editComment} defaultValue={comment.text} onChange={this.adjustHeight} 
                                            onDone={this.updateComment}/>
                                        <div className={css.editCommentActionsWrap}>
                                            <button onClick={this.cancelUpdateComment}className={css.editCommentActions}>Cancel</button>
                                            <button onClick={this.updateComment}className={css.editCommentActions}>Done</button>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div data-issueindex={issueIndex}  key={commentIndex} className={css.commentTextWrap} 
                                        data-commentindex={commentIndex} onDoubleClick={this.enableEditing}>
                                        <span style={{color : issueColor}} className={css.commentAuthor}>{this.props.author.email}:</span>
                                        <span className={css.commentText}>{comment.text}</span>
                                        {comment.metaStatus && <span className={css.commentMetadata}>{comment.metaStatus}</span>}
                                        {comment.metaAssignee && <span className={css.commentMetadata}>{comment.metaAssignee}</span>}
                                    </div>
                                );
                            }
                        })}
                    </div>

                    <footer className={css.footer}>
                        <select value={issue.status} onChange={this.changeStatus} data-issueindex={issueIndex}>
                            <option value="1">{statusText[1]}</option>
                            <option value="2">{statusText[2]}</option>
                            <option value="3">{statusText[3]}</option>
                        </select>

                        <select data-issueindex={issueIndex} onChange={this.changeAssignee}>

                            {unassigned && <option value="0">unassigned</option>}

                            {
                                projectMembers.map((member) => {
                                    return (
                                        <option key={member.id} value={member.id}>{member.email}</option>
                                    );
                                })
                            }
                        </select>
                    </footer>
                </div>
                
            </div>
        );
    }

}

module.exports = Issue;
