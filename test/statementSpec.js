import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

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
	
	t.is(p.pcs.main.BODY.segment.length, 0);
});

test('parse click', t => {
	var p = tokenizer('click "me";');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});

test('parse var decl', t => {
	var p = tokenizer('var a=1 , b =  2;');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});

test('parse log', t => {
	var p = tokenizer('log a +"输出";');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});

test('parse assert', t => {
	var p = tokenizer('assert ".btnG" in 3000;');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
	
	t.is(p.keys[0], '#0');
});

test('input statement', t => {
	var p = tokenizer('input [obj] by /abc/;');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
	
	t.true(p.dTable['obj']);
});

test('sequence expression', t => {
	var p = tokenizer('b = 2, a += 1;');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});