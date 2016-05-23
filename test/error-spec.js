import test from 'ava';
import {tokenizer, parseFragment} from '../src/parser/index.js';

test('block comment error', t => {
	var p = tokenizer(' /**** \n');
	
	t.throws(function (){ p.nextToken() }, SyntaxError);
});

test('# error', t => {
	var p = tokenizer(' #sets ');
	
	t.throws(function (){ p.nextToken() }, SyntaxError);
});

test('semi colon error', t => {
	var p = tokenizer('wait 3000\nassert');

	p.nextToken();
	
	t.throws(function (){ p.parseStatement() }, /expect[\s\S]+1:/i);
});

test('select by', t => {
	t.throws(() => parseFragment('select 1;'));
});

test('get html output', t => {
	var p = tokenizer('@@@@@', {left: '<code>', right: '</code>'});
	
	t.throws(function (){ p.nextToken() }, /code[\s\S]+code/);
});
