import test from 'ava';
import {parse} from '../src/parser/index.js';

test('parse whole thing', t => {
	t.notThrows(function () {
		parse('process main { var a = 1; }', {});
	});
});