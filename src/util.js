var _ = {
	now: Date.now || function () {
		return new Date().getTime();
	},
	isString: function (string) {
		return typeof string === 'string';
	},
	isUndefined: function (value) {
		return value === void 0;
	},
	isDefined: function (value) {
		return !_.isUndefined(value);
	},
	isNumber: function (value) {
		return typeof value === 'number';
	},
	isObject: function (obj) {
		var type = typeof obj;
		return type === 'function' || (type === 'object' && !!obj);
	},
	isElement: function (obj) {
		return !!(obj && obj.nodeType === 1);
	},
	isFunction: function (obj) {
		return typeof obj === 'function';
	},
	isArray: function (obj) {
		return ({}).toString.call(obj) === '[object Array]';
	},
	last: function (array) {
		return array[array.length - 1];
	},
	noop: function () {},
	forEach: function (obj, iteratee, context) {
		iteratee = iteratee.bind(context);
		var i, length;
		if (this.isArray(obj)) {
			for (i = 0, length = obj.length; i < length; i += 1) {
				iteratee(obj[i], i, obj);
			}
		} else {
			var keys = Object.keys(obj);
			for (i = 0, length = keys.length; i < length; i += 1) {
				iteratee(obj[keys[i]], keys[i], obj);
			}
		}
		return obj;
	},
	has: function has(obj, propName) {
		return Object.prototype.hasOwnProperty.call(obj, propName);
	}
};

module.exports = _;
