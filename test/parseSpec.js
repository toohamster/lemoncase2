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
  input [input] by /[/]/;
  input [input] by {selector};
		rclick time ;
		dblclick selector ;
		movein selector ;
		moveout time ;
		assert "null";
		assert <@"sth"/> in 00000;
  assert selector in 3000;
  log "yes";
  log "fuck\\\' \\"off";
  sub_1();
}
	`;
	
	t.notThrows(function () {
		parse(monster, {});
	});
});