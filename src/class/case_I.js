/*jslint vars: true, sloppy: true, nomen: true */
/*global Instruction, $CP, _, settings, callMainIns */

$CP.$setIdleTask = function (taskFn) {
	this.$$idleTask = _.isFunction(taskFn) ? taskFn : null;

	return this;
};

$CP.$setActiveTime = function (offset) {
	this.$$activeTime = _.now() + (offset || 0);

	return this;
};

$CP.$setTempInstruction = function (ins) {
	ins.$case = this;
	this.$$tempInstruction = ins;

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

$CP.$pushScope = function (segment) {
	// BlockStack
	var BS = this.$$blockStack;

	this.$$scopeStack.push({
		blockIndex: BS.length,
		vars: {}
	});
	this.$pushBlock(segment);

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
	return this.$$processes[identifier];
};

$CP.$exitLoop = function () {
	var loger = this.$$collector;

	this.$setActiveTime(this.$$config.nextLoopDelay || 3000);

	loger.log([-1, this.$$currentLoop]).markLog(0, loger.getLength('logs'));

	if ((this.$$currentLoop += 1) >= this.$$config.maxLoop) {
		this.$$exitCase();
		return this;
	}
	this.$setTempInstruction(callMainIns);
	(settings.nextLoopCallback || _.noop).call(this);

	if (this.$dictionary) {
		this.$$currentCaseData = this.$dictionary.fetch();
	}

	return this;
};

$CP.$runExp = function (expFn) {
	if (typeof expFn === 'function') {
		return expFn(this.$getCurrentScope().vars,
					 this.$objectList, this.$dictionary,
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
