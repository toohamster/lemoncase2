import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

test('parse set', t => {
	var p = tokenizer('#CLOCK 1234\n', {});
	p.nextToken();
	p.parseSet();
	
	t.is(p.conf.clock, 1234);
});