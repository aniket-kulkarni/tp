var React = require('react');
var analytics = require('../../util/analytics.js');
var ProjectStore = require('../project-store.js');
var ProjectService = require('../project-service.js');
var ManageView = require('./manage-view.jsx');

class Manage extends React.Component {

    constructor(props) {
        super(props);
        
        var state = ProjectStore.getState();
        this.orgMembers = state.organizationDetails.members;
        this.projectDetails = state.projectDetails;

        var nonProjectMembers = this.orgMembers.filter((member) => {
            if (!(this.isProjectMember(member))) {
                return true;
            }
            else {
                return false;
            }
        });

        var dataSource = nonProjectMembers.map((member) => {
            return member.email;
        });

        this.state = {
            selectedView : 'manageTeam',
            membersToBeAdded : [],
            dataSource,
            projectDetails : this.projectDetails,
            canSubmitAddMembers : false,
            canSubmitInviteMembers : false,
            status : null,
            successMessage : ''
        };

        analytics.page(analytics.pageKeys.Project_MembersAccess);
    }

    componentDidMount() {
        this.props.setSelectedView('manage');
    }

    isProjectMember(member) {
        var projectMembers = this.projectDetails.members;
        var isMember = false;
        for (let i = 0; i < projectMembers.length ; i++) {
            if (projectMembers[i].id === member.id) {
                isMember = true;
                break;
            }
        }

        return isMember;
    }

    handleSelect = (t) => { 
        var dataSource = this.state.dataSource;
        var index = dataSource.indexOf(t);
        dataSource.splice(index,1);
        var memberToBeAdded = (this.orgMembers.filter((member) => {
            return member.email === t;
        }))[0];
        this.state.membersToBeAdded.push(memberToBeAdded);
        var canSubmitAddMembers = (this.state.membersToBeAdded.length === 0) ? false : true;
        this.setState({ dataSource, membersToBeAdded : this.state.membersToBeAdded,canSubmitAddMembers});
    }

    addNewMembers () {
        this.setState({status : 'loading'});
        ProjectService.addNewMembers(this.projectDetails.id,this.state.membersToBeAdded)
            .then(() => {
                this.state.membersToBeAdded.forEach((member) => {
                    this.projectDetails.members.push(member);
                });
                this.state.membersToBeAdded = [];
                this.setState({status : 'success',successMessage : 'Successfully Added'});
            })
            .catch((rejection) => {
                this.setState({status : 'error',error : rejection.error.message});
            });
    }

    sendProjectMembersInvitation = (model) => {

        var emails = model.email.split(',');

        this.setState({status : 'loading'});

        ProjectService.sendProjectMembersInvitation(this.projectDetails.id,emails)
            .then(() => {
                this.setState({status : 'success',successMessage : 'Invitation success'});
            })
            .catch((rejection) => {
                this.setState({status : 'error',error : rejection.error.message});
            });
    }

    changeView = (e) => {
        
        var target = e.currentTarget;
        var view = target.dataset.view;

        if (this.state.selectedView === view) {
            return;
        }

        this.setState({
            selectedView : view
        });
    }

    handleRemove = (text,id) => {
        var membersToBeAdded = this.state.membersToBeAdded,index;
        for (let i = 0;i<membersToBeAdded.length; i++) {
            if (membersToBeAdded[i].id == id) {
                index = i;
                break;
            }
        }

        membersToBeAdded.splice(index,1);
        var dataSource = this.state.dataSource;
        dataSource.push(text);
        var canSubmitAddMembers = (membersToBeAdded.length === 0) ? false : true;
        this.setState({dataSource,membersToBeAdded,canSubmitAddMembers});
    }

    enableInviteSubmitButton = () => {
        this.setState({canSubmitInviteMembers : true});
    }

    disableInviteSubmitButton = () => {
        this.setState({canSubmitInviteMembers : false});
    }

    handleOk = () => {
        this.setState({
            status : null,
            error : null,
            successMessage : ''
        });
    }

    render() {
        return (

            <ManageView {...this.state} 
                sendProjectMembersInvitation={this.sendProjectMembersInvitation}
                handleOk={this.handleOk} 
                disableInviteSubmitButton={this.disableInviteSubmitButton}
                enableInviteSubmitButton={this.enableInviteSubmitButton}
                handleRemove={this.handleRemove}
                changeView={this.changeView}
                addNewMembers={this.addNewMembers.bind(this)}
                handleSelect={this.handleSelect} />
        );
    }

}

module.exports = Manage;
