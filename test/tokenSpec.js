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

test('parse number', t => {
	var p = tokenizer('23.06 1.2e-9 xx', {});
	p.nextToken();
	
	t.is(p.value, 23.06);
	
	p.nextToken();
	
	t.is(p.type.label, 'num');
	t.is(p.value, 1.2e-9);
});

test('parse string', t => {
	var p = tokenizer('"asdf \d xx"', {});
	p.nextToken();
	
	t.is(p.value, 'asdf \d xx');
});

test('parse regexp', t => {
	var p = tokenizer('/[/]/ /abc/iimmgg', {});
	p.exprAllowed = true;
	
	p.nextToken();
	t.is(p.type.label, 'regexp');
	
	p.exprAllowed = true;
	p.nextToken();
	t.same(p.value, {pattern:'abc', flags: 'iimmgg'});
});

test('index', t => {
	var p = tokenizer(' [mama]+{baba}');
	p.nextToken();
	
	t.is(p.type.label, 'dictionary index');
	t.is(p.value, 'mama');
	
	p.nextToken();
	p.nextToken();
	
	t.is(p.type.label, 'object@');
	t.is(p.value, 'baba');
})