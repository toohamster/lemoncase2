var tokenizer = require('../src/parser/index.js').tokenizer;

var p = tokenizer('#CLOCK 1234\n', {});
p.nextToken();
p.parseSet();