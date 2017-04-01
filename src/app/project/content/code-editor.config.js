var hintRules = {
    'tagname-lowercase': true,
    'attr-lowercase': true,
    'attr-value-double-quotes': true,
    'doctype-first': false,
    'tag-pair': true,
    'spec-char-escape': true,
    'id-unique': true,
    'src-not-empty': true,
    'attr-no-duplication': true
};

var config = {
    lineNumbers: true,
    lineWrapping : true,
    theme : 'oceanic-dark',
    indentUnit : 4,
    lint : true,
    dragDrop : false,
    mode: 'text/html'
};

module.exports = {
    hintRules,
    config
};
