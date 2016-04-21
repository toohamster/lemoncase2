/*jslint vars: true, sloppy: true, nomen: true */
/*global require, console, trigger, module */
var callMainIns, exitIns, settings, setup,
	_ = require('./util');

settings = {
	contextFrame: document.createElement('iframe'),
	defaultNextLoopDelay: 3000,
	readyTimeout: 3000,
	defaultClock: 10,
	bootExceptionHandle: _.noop,
	triggerCallback: _.noop,
	runCallback: _.noop,
	runExceptionHandle: function () {
		console.log(arguments);
	},
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

function getDocument() {
	if (settings.contextFrame) {
		return settings.contextFrame.contentWindow.document;
	}

	return document;
}

module.exports = {
	settings: settings,
	getDocument: getDocument,
	setup: setup,
	init: init,
	getLemoncaseFrame: getLemoncaseFrame
};
