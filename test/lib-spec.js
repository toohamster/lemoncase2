import test from 'ava';
import Collector from '../lib/collector';

const getCollector = function (keys) {
	return new Collector(keys).initialization();
}

test('basic log func', t => {
	let c = getCollector();

	c.log('test', -999);
	t.is(c.$logs.length, 1);

	c.markLog('test', 'test');
	t.is(c.$marks.length, 1);

	c.clear();
	t.falsy(c.$logs.length || c.$marks.length);
});

test('key value log', t => {
	let c = getCollector(['test1', 'test2']);
	
	c.data('test1', 'bullshit')
		.data('test2', 'nice')
		.data('test2', 'bueatiful');
	
	t.deepEqual(c.$datas, {
		test1: ['bullshit'],
		test2: ['nice', 'bueatiful']
	});
});

test('log exports', t => {
	let c = getCollector(['data1']);
	
	c.log('me', 1).markLog('me', 1).data('data1', 1);
	
	t.regex(c.export2text(), /data1/);
});