var create = require('../src/parser/earley/earley-core.js').create,
	use = require('../src/parser/earley/earley-core.js').use,
	testRule = require('../src/parser/earley/preset.js').testRule;

var input = "11+(2*322+5) -_-|||";
use(testRule);

var myLang = create([], 'Sum');

console.log(JSON.stringify(myLang.parse(input), null, 2));