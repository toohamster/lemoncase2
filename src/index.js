var parser = require('./parser/index');
var parse = parser.parse;
var parseAt = parser.parseFragment;
var Case = require('./class/case').Case;
var setup = require('./global').setup;
var IF = require('./class/instruction');
var global = require('./global');
var init = global.init;
var getLemoncaseFrame = global.getLemoncaseFrame;

require('./class/case_I');
require('./class/case_P');
require('../lib/ranexp');
require('./instructions');

var exports = {
	Case: Case,
	setup: setup,
	Instruction: IF,
	parse: parse,
	parseAt: parseAt,
	init: init,
	getLemoncaseFrame: getLemoncaseFrame
};

module.exports = exports;
