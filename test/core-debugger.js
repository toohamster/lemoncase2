var tokenizer = require('../src/parser/index.js').tokenizer;

var p = tokenizer('click "me";');
p.nextToken();
p.parseStatement();