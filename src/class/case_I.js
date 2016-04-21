/*jslint vars: true, sloppy: true, nomen: true */
/*global require, console, trigger, module */
var $CP = require('./case').$CP,
	_ = require('../util'),
	global = require('../global'),
	settings = global.settings,
	getDocument = global.getDocument,
	IF = require('./instruction'),
	CALL = require('../instructionType').CALL;

function countDOM(cssPath) {
	return getDocument().querySelectorAll(cssPath).length;
}
function getInnerHTML(cssPath) {
	var DOM = getDocument().querySelector(cssPath);
	if (DOM) {
		if (DOM.value) {
			if (DOM.type === 'checkbox' || DOM.type === 'radio') {
				return  DOM.checked;
			}
			return DOM.value;
		}
		return DOM.innerHTML;
	}
	
	return false;
}

function isVisible(cssPath) {
	var DOM = getDocument().querySelector(cssPath);
	if (!DOM) {
		return false;
	}

	return (DOM.offsetHeight === 0 && DOM.offsetWidth === 0) ? false : true;
}

function match(src, obj) {
	if (!_.isString(src)) {
		return false;
	}

	if (_.isString(obj)) {
		return !!src.indexOf(obj);
	}

	if (obj.test) {
		return obj.test(src);
	}

	return false;
}

$CP.$setIdleTask = function (taskFn) {
	this.$$idleTask = _.isFunction(taskFn) ? taskFn : _.noop;

	return this;
};

$CP.$setActiveTime = function (offset) {
	this.$$activeTime = _.now() + (offset || 0);

	return this;
};

$CP.$setTempInstruction = function (ins) {
	this.$$tempInstruction = ins ? ins.assignCase(this) : undefined;

	return this;
};

$CP.$setState = function (state) {
	this.$$state = state;

	return this;
};

$CP.$pushBlock = function (segment) {
	this.$$blockStack.push({
		counter: 0,
		segment: segment
	});

	return this;
};

$CP.$pushScope = function (identifer) {
	// BlockStack
	var BS = this.$$blockStack;

	this.$$scopeStack.push({
		blockIndex: BS.length,
		vars: {}
	});
	this.$pushBlock(this.$getProcess(identifer));

	return this;
};

$CP.$popBlock = function () {
	this.$$blockStack.pop();

	return this;
};

$CP.$popScope = function () {
	// Notice: To pop scope stack by this way because one scope relate to
	// one block but one block not relate to one scope necessarily. There
	// is a "blockIndex" property in scopes to show which block relate to,
	// and then we must pop all blocks (like if {...}, loop {...}) in the
	// process from "$blockStack".

	var BI = this.$$scopeStack.pop(); // (B)lock(I)nfo.
	this.$$blockStack.length = BI.blockIndex;

	return this;
};

$CP.$getCurrentBlock = function () {
	return _.last(this.$$blockStack);
};

$CP.$getCurrentScope = function () {
	return _.last(this.$$scopeStack);
};

$CP.$getProcess = function (identifier) {
	return this.$$executionTree.process[identifier];
};

$CP.$exitLoop = function () {
	this.$setActiveTime(this.$$getConfig('interval') || 3000);

	if ((this.$$currentLoop += 1) >= this.$$getConfig('times')) {
		this.$$exitCase();
		return this;
	}
	this.$setTempInstruction(IF(CALL).create('main'));
	(settings.nextLoopCallback || _.noop).call(this);

	if (this.hasDictionary()) {
		this.$loopData = this.$dictionary.fetch();
	}

	return this;
};

$CP.$runExp = function (expFn) {
	if (typeof expFn === 'function') {
		return expFn(this.$$vars, this.$objectList, this.$loopData,
					 countDOM, getInnerHTML, isVisible, match);
	}
	return expFn;
};

$CP.$pushLog = function (content, line) {
	this.getLog().log(content, line);

	return this;
};

$CP.$markLog = function (type, msg) {
	this.getLog().markLog(type, msg);

	return this;
};

$CP.$pushLogData = function (assertId, delay) {
	this.getLog().data(assertId, delay);

	return this;
};

$CP.$clearScope = function () {
	while (this.$$scopeStack.length) {
		this.$popScope();
	}

	return this;
};

module.exports = $CP;
