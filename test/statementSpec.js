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