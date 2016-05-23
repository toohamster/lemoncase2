import test from 'ava';
import _ from '../src/util';

test('is string', t => {
	t.true(_.isString(''));
	t.false(_.isString(null));
});

test('is undefined', t => {
	t.true(_.isUndefined(undefined));
	t.true(_.isDefined(null));
});

test('is number', t => {
	t.true(_.isNumber(NaN));
	t.false(_.isNumber(''));
});

test('is object', t => {
	t.true(_.isObject(Object.create(null)));
	t.false(_.isObject(NaN));
});

test('is function', t => {
	t.true(_.isFunction(test));
	t.false(_.isFunction(NaN));
});

test('is array', t => {
	t.true(_.isArray([]));
	t.false(_.isArray(''));
});

test('last', t => {
	t.is(_.last([222]), 222);
});

test('for each', t => {
	let c = 0;
	
	_.forEach([1,2,3,4,5], () => c++);
	
	t.is(c, 5);
});

test('has', t => {
	
});
