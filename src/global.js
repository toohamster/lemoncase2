/*jslint vars: true, sloppy: true, nomen: true */
/*global require, console, trigger, module */
var callMainIns, exitIns, _, settings, setup;

_ = {
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
	document: function () {
		if (settings.contextFrame) {
			return settings.contextFrame.contentWindow.document;
		}
		return document;
	},
	countDOM: function (cssPath) {
		return _.document().querySelectorAll(cssPath).length;
	},
	getInnerHTML: function (cssPath) {
		var DOM = _.document().querySelector(cssPath);
		if (DOM) {
			return DOM[DOM.value ? 'value' : 'innerHTML'];
		}
		//TODO 它不存在就不应该有任何输出
		return 'Error:No such HTMLElement.';
	},
	isVisible: function (cssPath) {
		var DOM = _.document().querySelector(cssPath);
		if (!DOM) {
			return false;
		}

		return (DOM.offsetHeight === 0 && DOM.offsetWidth === 0 ) ? false : true;
	}
};

settings = {
	contextFrame: document.createElement('iframe'),
	defaultNextLoopDelay: 3000,
	readyTimeout: 3000,
	defaultClock: 10,
	bootExceptionHandle: _.noop,
	triggerCallback: _.noop,
	runCallback: _.noop,
	runExceptionHandle: _.noop,
	successCallback: _.noop,
	readyCallback: _.noop,
	nextLoopCallback: _.noop,
	consoleFn: _.noop
};

setup = function (options) {
	if (_.isString(options)) {
		return settings[options];
	}

	if (_.isObject(options)) {
		_.forEach(options, function (value, key) {
			this[key] = value;
		}, settings);
		return;
	}
};
setup.setContextFrame = function (iframeDOM) {
	trigger.setupIframe(iframeDOM);
	settings.contextFrame = iframeDOM;
};

function init(wrapDOM, callback) {
	var e = settings.contextFrame;
	e.style.height = '100%';
	e.style.width = '100%';

	wrapDOM.appendChild(e);
	(callback || _.noop).call(e);
}

function getLemoncaseFrame() {
	return settings.contextFrame;
}

module.exports = {
	'_': _,
	settings: settings,
	setup: setup,
	init: init,
	getLemoncaseFrame: getLemoncaseFrame
};
