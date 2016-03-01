var tokenizer = require('../src/parser/index.js').tokenizer;

var p = tokenizer('wait 3000\nassert');
p.nextToken();

console.log(JSON.stringify(p.parseStatement(), null, 2));
// console.log(p.parseStatement().BODY.msg.toString());

// var parse = require('../src/parser/index.js').parse;

// console.log(JSON.stringify(parse('process main { return;\n', {}), null, 2));