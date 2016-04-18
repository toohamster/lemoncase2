import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

test('parse kw', t => {
	var p = tokenizer(' process ', {});
	p.nextToken();
	
	t.is(p.type.label, 'process');
	t.is(p.value, 'process');
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
	t.is(p.value.isGenerate, false);
	
	p.genAllowed = true;
	p.nextToken();
	t.deepEqual(p.value, {pattern:'abc', flags: 'iimmgg', isGenerate: true});
});

test('index', t => {
	var p = tokenizer(' [mama]+{baba}');
	p.nextToken();
	
	t.is(p.type.label, 'dictionaryIndex');
	t.is(p.value, 'mama');
	
	p.nextToken();
	t.is(p.type.label, '+/-');
	
	p.nextToken();
	
	t.is(p.type.label, 'objectStore');
	t.is(p.value, 'baba');
});

test('multiple and modulo', t => {
	var p = tokenizer('*%');
	
	p.nextToken();
	t.is(p.type.label, '*');
	
	p.nextToken();
	t.is(p.type.label, '%');
});

test('tag', t => {
	var p = tokenizer('/><@<#');
	
	p.nextToken();
	t.is(p.type.label, '/>');
	
	p.nextToken();
	t.is(p.type.label, 'TextExpr');
	
	p.nextToken();
	t.is(p.type.label, 'CountExpr');
});