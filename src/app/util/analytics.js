/**
 * A wrapper for segment analytics service actually
 * @type {[type]}
 */

var analytics = window.analytics;

var methods = ['trackSubmit','trackClick','trackLink','trackForm','pageview','identify','reset','group','track','ready','alias','page','once','off','on'];

for (var method in methods) {
    module.exports[methods[method]] = analytics ? analytics[methods[method]] : function () {
        // Should do something here but who knows what
    };
}

module.exports.trackKeys = {
    Organisation_Sign_Up_Started : 'Organisation_Sign_Up_Started',
    Organisation_Sign_Up_Successful : 'Organisation_Sign_Up_Successful',
    Organisation_Sign_Up_Failed : 'Organisation_Sign_Up_Failed',
    Login_Started : 'Login_Started',
    Login_Successful : 'Login_Successful',
    Login_Failed : 'Login_Failed',
    Logout_Started : 'Logout_Started',
    Logout_Successful : 'Logout_Successful',
    Logout_Failed : 'Logout_Failed',
    dashboard_view_clicked : 'Dashboard_View_Clicked',
    content_view_clicked : 'Content_View_clicked',
    configure_view_clicked : 'Configure_View_Clicked',
    theme_view_clicked : 'Theme_View_Clicked',
    review_view_clicked : 'Review_View_Clicked',
    manage_view_clicked : 'Manage_View_Clicked',
    export_view_clicked : 'Export_View_Clicked',
    Create_Project_Started : 'Create_Project_Started',
    Create_Project_Successful : 'Create_Project_Successful',
    Create_Project_Failed : 'Create_Project_Failed',
    Inviting_Project_Members_Started : 'Inviting_Project_Members_Started',
    Inviting_Project_Members_Successful : 'Inviting_Project_Members_Successful',
    Inviting_Project_Members_Failed : 'Inviting_Project_Members_Failed',
    Add_Project_Members_Started : 'Add_Project_Members_Started',
    Add_Project_Members_Successful : 'Add_Project_Members_Successful',
    Add_Project_Members_Failed : 'Add_Project_Members_Failed',
    Add_New_File_To_Project_Started : 'Add_New_File_To_Project_Started',
    Add_New_File_To_Project_Successful : 'Add_New_File_To_Project_Successful',
    Add_New_File_To_Project_Failed : 'Add_New_File_To_Project_Failed',
    Rename_File_Started : 'Rename_File_Started',
    Rename_File_Successful : 'Rename_File_Successful',
    Rename_File_Failed : 'Rename_File_Failed',
    Delete_File_Started : 'Delete_File_Started',
    Delete_File_Successful : 'Delete_File_Successful',
    Delete_File_Failed : 'Delete_File_Failed'
};

module.exports.pageKeys = {
    Org_SignUp : 'Org_SignUp', 
    Login : 'Login',
    Invite_Project_Member : 'Invite_Project_Member',
    Invite_Project_Member_Interstitial : 'Invite_Project_Member_Interstitial',
    User_Dashboard : 'User_Dashboard',
    Project_Configure : 'Project_Configure',
    Project_Theme : 'Project_Theme',
    Project_ReviewErrors : 'Project_ReviewErrors',
    Project_MembersAccess : 'Project_MembersAccess',
    Project_Export : 'Project_Export',
    Project_Content : 'Project_Content'
};