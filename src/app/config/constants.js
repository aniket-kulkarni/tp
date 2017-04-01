module.exports = (function() {

    return {
        APP_NAME : 'Tricon Publish',

        REGISTER_URL : '/api/auth/register',
        LOGIN_URL : '/api/auth/login',
        LOGOUT_URL : '/api/auth/logout',
        INIT_DASHBOARD_URL : '/api/dashboard',

        CREATE_PROJECT_URL : '/api/project',

        PROJECT_MEMBER_INVITE_URL : '/api/project/:id/invite/',
        ADD_PROJECT_MEMBER_URL : '/api/project/:id/members/',

        ADD_NEW_FILE_TO_PROJECT : '/api/project/:id/file/:filePath',
        RENAME_FILE_URL : '/api/project/:id/rename/file/:filePath',
        DELETE_FILE_URL : '/api/project/:id/file/:filePath',
        GET_FILE_CONTENT_URL : '/api/project/:id/file/:filePath',
        GET_ASSETS_FILE_CONTENT_URL : '/api/project/:id/assets/file/:filePath',
        SAVE_FILE_CONTENT_URL : '/api/project/:id/file/:filePath',

        SAVE_ISSUES_URL : '/api/issues/project/:id',
        UPDATE_STRUCTURE_URL : '/api/project/:id/structure',

        GET_EXPORT_DATA_URL : '/api/export/project/:id/',
        GET_READ_DATA_URL : '/api/export/:id/read',
        GET_READ_DATA_URL_WITH_PIN : '/api/export/:id/read',
        DOWNLOAD_EPUB_BASE : '/api/export/',
        PROJECT_EXPORT_URL : '/api/export/project/:id/epub',
        PROJECT_WEB_EXPORT_URL : '/api/export/project/:id/web',
        DOWNLOAD_EXPORT_URL : '/api/export/project/:id/epub/download',
        ACCEPT_PROJECT_MEMBER_INVITE_URL : '/api/project/invite/:id/accept',

        SERVER_CONNECTION_ERROR : 'Cannot connect to the server',
        GET_PROJECT_DETAILS_URL : '/api/project/:id',
        SERVER_ERROR : 'Oops!! Something Went Wrong.',
        DEFAULT_PROJECT_COVER_URL : 'images/default_cover.jpg'
    };

})();