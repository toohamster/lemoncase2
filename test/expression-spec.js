import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

test('basic assign', t => {
	var p = tokenizer('var a = "变量a";');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});

test('precedence and parenthesis', t => {
	var p = tokenizer('var a = 1 * (2 + 3);');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});

test('parse rclick / <>', t => {
	var p = tokenizer('rclick <#a  +2*(3+4)/>;');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});

test('parse shiny ~~', t => {
	var p = tokenizer('assert <#"asdf"/> ~~ "b" && <#"asdf"/> !~ "d";');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});

test('parse unary', t => {
	var p = tokenizer('assert !<!"h1 > .container"/>;');
	p.nextToken();
	
	t.notThrows(function (){
		p.parseStatement();
	});
});