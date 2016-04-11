/*jslint plusplus: true, sloppy: true, nomen: true */
/*global require, console, trigger, module */
var CALL = require('../instructionType').CALL,
	EXIT = require('../instructionType').EXIT,
	global = require('../global'),
	_ = global['_'],
	settings = global.settings,
	Collector = require('../../lib/collector'),
	IF = require('./instruction');

function linker(syntaxTree, object, dictionary, $case) {
	var eT = {
		process: {},
		config: {}
	}, dk = [];

	_.forEach(syntaxTree.DATA_KEYS, function (isWatched, key) {
		if (isWatched) {
			dk.push(key);
		}
	});

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
	eT.config.screen = syntaxTree.CONFIG.screen;


	return {
		eT: eT,
		dK: dk
	};
}
function Case(syntaxTree, object, dictionary) {
	if (!(this instanceof Case)) {
		return new Case(syntaxTree, object, dictionary);
	}

	var link = linker(syntaxTree, object, dictionary, this);
	// executionTree
	this.$$executionTree = link.eT;

	// Outside object.
	this.$dictionary = dictionary;
	this.$objectList = object;
	this.$$log = new Collector(link.dK);

	// states
	this.$$state = 'ready';
	this.$$coreId = null;
	this.$$activeTime = 0;
	this.$$currentLoop = 0;

	// stacks
	this.vars = {};
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
	var frm = settings.contextFrame.style,
		srnOpt = this.$$getConfig('screen');

	this.$$currentLoop = 0;

	if (this.hasDictionary()) {
		this.$loopData = this.$dictionary.load(this.$$getConfig('times')).fetch();
	}

	if (srnOpt) {
		frm.height = srnOpt.height + 'px';
		frm.width = srnOpt.width + 'px';
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
		return IF(EXIT).create(true).assignCase(this);
	}
};

$CP.$$run = function () {
	try {
		this.$$popInstruction().execute();
		settings.runCallback.call(this);
	} catch (error) {
		console.error('[Error FROM LC2]:' + error);
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

module.exports = {
	Case: Case,
	$CP: $CP
};
