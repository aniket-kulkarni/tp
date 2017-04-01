// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Depends on csslint.js from https://github.com/stubbornella/csslint

// declare global: CSSLint

'use strict';
var CodeMirror = require('codemirror/lib/codemirror');
var {CSSLint} = require('csslint');
var {lintRules} = require('../../app/project/theme/theme-editor.config.js');

CodeMirror.registerHelper("lint", "css", function(text) {
  var found = [];
  var results = CSSLint.verify(text,lintRules), messages = results.messages, message = null;
  for ( var i = 0; i < messages.length; i++) {
    message = messages[i];
    var startLine = message.line -1, endLine = message.line -1, startCol = message.col -1, endCol = message.col;
    found.push({
      from: CodeMirror.Pos(startLine, startCol),
      to: CodeMirror.Pos(endLine, endCol),
      message: message.message,
      severity : message.type
    });
  }
  return found;
});
