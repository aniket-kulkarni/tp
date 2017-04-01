// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Depends on htmlhint.js from http://htmlhint.com/js/htmlhint.js

'use strict';
var CodeMirror = require('codemirror/lib/codemirror');
var {HTMLHint} = require('htmlhint');

var {hintRules} = require('../../app/project/content/code-editor.config.js');

CodeMirror.registerHelper('lint', 'html', function(text, options) {
    var found = [];    
    var messages = HTMLHint.verify(text, hintRules);
    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        var startLine = message.line - 1, endLine = message.line - 1, startCol = message.col - 1, endCol = message.col;
        found.push({
            from: CodeMirror.Pos(startLine, startCol),
            to: CodeMirror.Pos(endLine, endCol),
            message: message.message,
            severity : message.type
        });
    }
    return found;

});

