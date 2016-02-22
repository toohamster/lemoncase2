import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

test('parse kw', t => {
	var p = tokenizer(' #set ', {});
	p.nextToken();
	
	t.is(p.type.label, '#set');
	t.is(p.value, '#set');
});

test('parse name', t => {
	var p = tokenizer(' a ', {});
	p.nextToken();
	
	t.is(p.type.label, 'name');
	t.is(p.value, 'a');
});