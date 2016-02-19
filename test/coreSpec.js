import test from 'ava';

import {create, use} from '../src/parser/earley/earley-core.js';
import {testRule} from '../src/parser/earley/preset.js';

test('basic arithmatic', t => {
	use(testRule);
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