import test from 'ava';
import genExpr from '../src/parser/walk.js';

test('walk', t => {
	var string = genExpr({
		type: 'regexp',
		raw: '|^abcd|i',
		regexp: {
			pattern: '^abcd',
			flags: 'i',
			isGenerate: true
		}
	}).toString();
	
	t.regex(string, /\.gen/);
});