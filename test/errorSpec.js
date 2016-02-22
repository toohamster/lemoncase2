import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

test('block comment error', t => {
	var p = tokenizer(' /**** \n', {});
	
	t.throws(function (){ p.nextToken() }, SyntaxError);
});

test('# error', t => {
	var p = tokenizer(' #sets ', {});
	
	t.throws(function (){ p.nextToken() }, SyntaxError);
});