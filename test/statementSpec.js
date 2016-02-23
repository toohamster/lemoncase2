import test from 'ava';
import {tokenizer} from '../src/parser/index.js';

test('parse set', t => {
	var p = tokenizer('#CLOCK 1234\n#TIMES \t200 \n', {});
	p.nextToken();
	
	p.parseStructure();
	t.is(p.conf.clock, 1234);
	
	p.parseStructure();
	t.is(p.conf.times, 200);
});