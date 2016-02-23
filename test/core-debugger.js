var tokenizer = require('../src/parser/index.js').tokenizer;

var p = tokenizer('#CLOCK 1234\n#TIMES 200\n', {});
p.nextToken();
p.parseStructure();
p.parseStructure();