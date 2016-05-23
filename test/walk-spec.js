import test from 'ava';
import genExpr from '../src/parser/walk.js';

test('walk regexp', t => {
	var string = genExpr({
		type: 'regexp',
		raw: '/^abcd/i',
		regexp: {
			pattern: '^abcd',
			flags: 'i',
			isGenerate: true
		}
	}).toString();
	
	t.regex(string, /\.gen/);
});

test('walk ~~', t => {
	var string = genExpr({
		type: 'MatchExpr',
		left: {type: 'literal', raw: 'ppp'},
		operator: '~=',
		right: {type: 'literal', raw: 'qqq'}
	}).toString();
	
	t.true(!/match\.length/.test(string), 'no string.match.length');
});