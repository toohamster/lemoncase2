// var tokenizer = require('../src/parser/index.js').tokenizer;

// var p = tokenizer('input [obj] by /abc/;');
// p.nextToken();

// console.log(JSON.stringify(p.parseStatement(), null, 2));

var parse = require('../src/parser/index.js').parse;

console.log(JSON.stringify(parse('process main { var a = 1; }', {}), null, 2));