import test from 'ava';
import {tokenizer, parseFragment} from '../src/parser/index.js';

test('parse macro', t => {
	var p = tokenizer('#CLOCK 1234\n#TIMES \t200 \n', {});
	p.nextToken();
	
	p.parseStructure();
	t.is(p.conf.clock, 1234);
	
	p.parseStructure();
	t.is(p.conf.times, 200);
});

test('parse process', t => {
	var p = tokenizer('//main\n process main (a, b){}\n', {});
	p.nextToken();
	
	p.parseStructure();
	
	// auto insert
	t.is(p.pcs.main.BODY.segment.length, 1);
});

test('parse click', t => {
	t.notThrows(() => parseFragment('click "me";'));
});

test('parse var decl', t => {
	t.notThrows(() => parseFragment('var a=1 , b =  2;'));
});

test('parse log', t => {
	t.notThrows(() => parseFragment('log a +"输出";'));
});

test('parse assert', t => {
	var p = tokenizer('assert ".btnG" in 3000;');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
	
	t.true(p.keys['#0']);
});

test('input statement', t => {
	t.notThrows(() => parseFragment('input obj + "1" by /abc/;'));
});

test('select', t => {
	t.notThrows(() => parseFragment('select 1;'));
});

test('sequence expression', t => {
	t.notThrows(() => parseFragment('b = 2, a += 1;'));
});