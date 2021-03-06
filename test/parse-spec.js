import test from 'ava';
import {parse} from '../src/parser/index.js';

test('parse whole thing', t => {
	t.notThrows(function () {
		parse('process main { var a = 1; }', {});
	});
});

test('parse a monsterous thing', t => {
	var monster = `
	// macros
  #CLOCK 12;
		#TIMES 99;
		#INTERVAL 999;
		#SCREEN 1,2

/**
* main entry
*/
process main {
	var selector = "button";
	var time = 999999;
	time = 108, selector = ".btnG";
		click ".btnG";
  input selector by "1";
  input "input" by /test\d{4}/img;
  input "input" by /[/]/;
  input "input" by selector + 1;
		rclick time ;
		dblclick selector ;
		movein selector ;
		moveout time ;
		assert "null";
		assert <@"sth"/> in 00000;
  assert selector in 3000;
  log "yes";
  console "fuck\\\' \\"off";
  sub_1();
}

process sub_1 (){}
	`;
	
	t.notThrows(function () {
		parse(monster, {});
	});
});

test('UID correctness', t => {
	parse('process main { assert "1"; }', {});
	parse('process main { assert "1"; }', {});
	parse('process main { assert "1"; }', {});
	
	var p = parse('process main { assert "1" in 1; }', {});
	
	t.true(p.DATA_KEYS['#0']);
});