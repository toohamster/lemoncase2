import test from 'ava';

import {create, use} from '../src/parser/earley/earley-core.js';
import preset from '../src/parser/earley/preset.js';

test('basic arithmatic', t => {
	use(preset.testRule);
	let myLang = create([], 'Sum');
	
	let input = "11+(2*322+5) -_-|||";
	let expect = {
		"left": {
			"type": "number",
			"value": 11
		},
		"op": "+",
		"right": {
			"left": {
				"left": {
					"type": "number",
					"value": 2
				},
				"op": "*",
				"right": {
					"type": "number",
					"value": 322
				}
			},
			"op": "+",
			"right": {
				"type": "number",
				"value": 5
			}
		}
	};
	
	t.same(myLang.parse(input), expect, 'expect parse result');
});

test('empty rule', t => {
	use(preset.testEmpty);
	let myLang = create([], 'Empty');
	
	let input = '';
	t.is(myLang.parse(input), null);
});

// test('regular expression', t => {
// 	use(preset.regex);
// 	let myLang = create([], 'Regex');
	
// 	t.same(myLang.parse('/aa/'), {pattern:'aa', flag:''});
// });