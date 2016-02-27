import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

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