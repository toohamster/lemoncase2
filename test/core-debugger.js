var create = require('../src/parser/earley/earley-core.js').create,
	use = require('../src/parser/earley/earley-core.js').use,
	preset = require('../src/parser/earley/preset.js');

// var input = "11+(2*322+5) -_-|||";
// use(preset.testRule);

// var myLang = create([], 'Sum');

// var input = '';
// use(preset.testEmpty);
// var myLang = create([], 'Empty');

var input = '/[/]/';
use(preset.regex);
var myLang = create([], 'Regex');

console.log(JSON.stringify(myLang.parse(input), null, 2));