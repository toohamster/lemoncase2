/*jslint vars: true, sloppy: true, nomen: true */
/*global Instruction, $CP, _, settings, IF, CALL */

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
	this.$$blockStack.length = 0;
	this.$$scopeStack.length = 0;
	this.$setTempInstruction(IF(CALL).create('main'));
	(settings.nextLoopCallback || _.noop).call(this);

	if (this.hasDictionary()) {
		this.$loopData = this.$dictionary.fetch();
	}

	return this;
};

$CP.$runExp = function (expFn) {
	if (typeof expFn === 'function') {
		return expFn(this.$getCurrentScope().vars,
					 this.$objectList, this.$loopData,
					 _.countDOM, _.getInnerHTML);
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
