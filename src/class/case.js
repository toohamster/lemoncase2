/*jslint plusplus: true, sloppy: true, nomen: true */
/*global CALL, EXIT, _, settings, Collector, console, IF */
function linker(syntaxTree, object, dictionary, $case) {
	var eT = {
		process: {},
		config: {}
	};

	_.forEach(syntaxTree.DICTIONARY_KEYS, function (v, fieldName) {
		if (!dictionary.isFieldDefined(fieldName)) {
			throw new Error('The field: ' + fieldName + ' is undefined in dictionary.');
		}
	});

	_.forEach(syntaxTree.OBJECT_KEYS, function (v, objectName) {
		if (!object.hasOwnProperty(objectName)) {
			throw new Error('The key: ' + objectName + ' is undefined in object.');
		}
	});

	_.forEach(syntaxTree.PROCESSES, function (prcOpts, prcName) {
		var prc = eT.process[prcName] = [];
		_.forEach(prcOpts.BODY.segment, function (insOpts) {
			prc.push(IF(insOpts.TYPE).$new(insOpts, $case));
		});
	});

	eT.config.times = syntaxTree.CONFIG.times;
	eT.config.interval = syntaxTree.CONFIG.interval;

	return eT;
}
function Case(syntaxTree, object, dictionary) {
	if (!(this instanceof Case)) {
		return new Case(syntaxTree);
	}

	// executionTree
	this.$$executionTree = linker(syntaxTree, object, dictionary, this);

	// Outside object.
	this.$dictionary = dictionary;
	this.$objectList = object;
	this.$$log = new Collector(syntaxTree.DATA_KEYS);

	// states
	this.$$state = 'ready';
	this.$$coreId = null;
	this.$$activeTime = 0;
	this.$$currentLoop = 0;

	// stacks
	this.$$blockStack = []; // {counter, segment}
	this.$$scopeStack = []; // {blockIndex, vars}

	// buffer
	this.$$instructionBuffer = undefined;
	this.$$tempInstruction = undefined;
	this.$$idleTask = _.noop;
	this.$loopData = null;
}

var $CP = Case.prototype;

$CP.$$getConfig = function (key) {
	return this.$$executionTree.config[key];
};

$CP.$$bootstrap = function () {
	this.$$currentLoop = 0;

	if (this.hasDictionary()) {
		this.$loopData = this.$dictionary.load(this.$$getConfig('times')).fetch();
	}

	this.$setActiveTime()
		.$setTempInstruction(IF(CALL).create('main'))
		.$$log.initialization();

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

$CP.$$popInstruction = function () {
	var tmpIns = this.$$tempInstruction,
		block = this.$getCurrentBlock();

	if (tmpIns) {
		this.$setTempInstruction();
		return tmpIns;
	} else if (block) {
		this.$$instructionBuffer = block.segment[block.counter++];
		return this.$$instructionBuffer;
	} else {
		return IF(EXIT).create().assignCase(this);
	}
};

$CP.$$run = function () {
	try {
		this.$$popInstruction().execute(this);
		settings.runCallback.call(this);
	} catch (error) {
		console.error(error);
		settings.runExceptionHandle.call(this, error);
	}
	return this;
};

$CP.$$core = function () {
	var CASE = this;

	this.$$coreId = setInterval(function () {
		CASE['$$' + (_.now() >= CASE.$$activeTime ? 'run' : 'idleTask')]();
	}, this.$$getConfig('clock') || settings.defaultClock);

	return this;
};
