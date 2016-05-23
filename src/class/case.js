/*jslint plusplus: true, sloppy: true, nomen: true */
/*global require, console, trigger, module */
var instructionType = require('../instructionType');
var CALL = instructionType.CALL;
var EXIT = instructionType.EXIT;
var _ = require('../util');
var settings = require('../global').settings;
var Collector = require('../../lib/collector');
var IF = require('./instruction');
var parse = require('../parser/index').parse;

function linker(syntaxTree, $case) {
	var eT = { process: {}, config: {} }, dk = [];

	_.forEach(syntaxTree.DATA_KEYS, function (isWatched, key) {
		if (isWatched) {
			dk.push(key);
		}
	});

	_.forEach(syntaxTree.PROCESSES, function (prcOpts, prcName) {
		var prc = eT.process[prcName] = [];
		_.forEach(prcOpts.BODY.segment, function (insOpts) {
			prc.push(IF(insOpts.TYPE).$new(insOpts, $case));
		});
	});

	eT.config.times = syntaxTree.CONFIG.times || 1;
	eT.config.interval = syntaxTree.CONFIG.interval;
	eT.config.screen = syntaxTree.CONFIG.screen;

	return {
		eT: eT,
		dK: dk
	};
}
function Case(syntaxTree) {
	if (!(this instanceof Case)) {
		return new Case(syntaxTree);
	}

	if (_.isUndefined(syntaxTree)) {
		return new Case(parse('process main{}'));
	}

	var link = linker(syntaxTree, this);
	// executionTree
	this.$$executionTree = link.eT;

	// Outside object.
	this.$$log = new Collector(link.dK);

	// states
	this.$$state = 'ready';
	this.$$coreId = null;
	this.$$activeTime = 0;
	this.$$currentLoop = 0;

	// stacks
	this.$$vars = {};
	this.$$blockStack = []; // {counter, segment}
	this.$$scopeStack = []; // {blockIndex, vars}

	// buffer
	this.$$lastInstruction = undefined;
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

	if (srnOpt) {
		frm.height = srnOpt.height + 'px';
		frm.width = srnOpt.width + 'px';
	}

	(settings.loopCallback || _.noop)(this);

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

	this.$$lastInstruction = this.$$instructionBuffer;

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
		settings.runCallback(this);
	} catch (e) {
		console.error('[Error FROM LC2 Core]:' + e);
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
