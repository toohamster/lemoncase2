/*jslint vars: true, sloppy: true, nomen: true */
/*global Instruction, _, settings, Collector, console, callMainIns */
function linker(syntaxTree) {
	//TODO link tree.
	var executionTree = {};

	return executionTree;
}
function Case(syntaxTree) {
	if (!(this instanceof Case)) {
		return new Case(syntaxTree);
	}

	// executionTree
	this.$$executionTree = linker(syntaxTree);

	// Outside object.
	this.$dictionary = null;
	this.$objectList = null;
	this.$$log = new Collector(syntaxTree.DATA_KEYS); //TODO

	// states
	this.$$state = 'ready';
	this.$$coreId = null;
	this.$$activeTime = 0;
	this.$$currentLoop = 0;

	// stacks
	this.$$rootScope = {
		caseData: null
	};
	this.$$globalVariable = {};
	this.$$blockStack = []; // {counter, segment}
	this.$$scopeStack = []; // {blockIndex, vars}

	// buffer
	this.$$instructionBuffer = undefined;
	this.$$tempInstruction = undefined;
	this.$$idleTask = null;
}

var $CP = Case.prototype;

$CP.$$getConfig = function (key) {
	return this.$$executionTree.CONFIG[key];
};

$CP.$$bootstrap = function () {
	this.$$currentLoop = 0;

	if (this.hasDictionary()) {
		this.$$currentCaseData =
			this.$dictionary.load(this.$$getConfig('maxLoop')).fetch();
	}

	if (!this.validateObjectList(this.$objectList, this.$$syntaxTree.OBJECT_KEYS)) {
        var err = new Error('元件库错误');
        settings.runExceptionHandle.call(this, err);
        //stop here or otherwise it will start the timer after 3000ms
        throw err;
	}

	this.$setActiveTime()
		.$setTempInstruction(IF(0x00).create('main'))
		.$$collector.initialization();

	return this;
};

$CP.$$exitCase = function () {
	this.$setState('success').$$interrupt();
	(settings.successCallback || _.noop).call(this);

	return this;
};

$CP.$$interrupt = function () {
	clearInterval(this.$$coreId);

	return this;
};

$CP.$$setInstruction = function () {
	if (!this.$$tempInstruction) {
		var block = this.$getCurrentBlock();
		this.$$instructionBuffer
			= block ? block.segment[block.counter] : undefined;
	}

	return this;
};

$CP.$$setCounter = function (offset) {
	var block = this.$getCurrentBlock();
	if (!this.$$tempInstruction && block) {
		block.counter += (offset || 1);
	}

	return this;
};

$CP.$run = function () {
	var ins = this.$$tempInstruction || this.$$instructionBuffer;
	try {
		this.$setTempInstruction();

		if (ins) {
			ins.execute(this);

			settings.runCallback.call(this, ins);
		} else {
			this.$exitLoop();
		}

		return this;
	} catch (error) {
		console.error(error);
		settings.runExceptionHandle.call(this, ins, error);
	}
};

$CP.$$core = function () {
	this.$$coreId = setInterval(function () {
		if (_.now() >= this.$$activeTime) {
			this.$$setInstruction().$$setCounter().$run();
		} else {
			(this.$$idleTask || _.noop).call(this);
		}
	}.bind(this), this.$$getConfig('clock') || settings.defaultClock);

	return this;
};
