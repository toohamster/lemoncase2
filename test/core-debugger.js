var tokenizer = require('../src/parser/index.js').tokenizer;

var p = tokenizer(' [mama]+{baba}');
p.nextToken();

p.nextToken();
p.nextToken();