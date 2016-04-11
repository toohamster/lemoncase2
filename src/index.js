var parse = require('./parser/index').parse,
	Case = require('./class/case').Case,
	setup = require('./global').setup,
	IF = require('./class/instruction'),
	Dictionary = require('./class/dictionary'),
	global = require('./global'),
	init = global.init,
	getLemoncaseFrame = global.getLemoncaseFrame;

require('./class/case_I');
require('./class/case_P');
require('../lib/ranexp');
require('./instructions');

var exports = {
	Case: Case,
	setup: setup,
	Instruction: IF,
	parse: parse,
	Dictionary: Dictionary,
	init: init,
	getLemoncaseFrame: getLemoncaseFrame
};

module.exports = exports;