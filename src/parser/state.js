var getOptions = require('./options').getOptions;
var keywordRegexp = require('./identifier').keywordRegexp;
var tt = require('./tokentype').types;

var Parser = function (options, input) {
	this.options = getOptions(options);
	this.keywords = keywordRegexp;
	this.input = String(input);

	this.pos = 0;

	this.type = tt.eof;
	this.value = null;

	this.start = this.end = this.pos;

	this.lastTokStart = this.lastTokEnd = this.pos;

	this.exprAllowed = false;
	this.genAllowed = false;

	this.labels = [];

	// conf - #set
	this.conf = {};
	this.keys = {};
	this.nextID = 0;
	// keep track of process body(statements)
	this.pcs = {};
	//keep track of all the unused process/ declared process
	this.pcsTable = {};
};

Parser.prototype.parse = function () {
	this.nextToken();

	var program = {
		CONFIG: this.conf,
		DATA_KEYS: this.keys,
		PROCESSES: this.pcs
	};

	return this.parseTopLevel(program);
};

var extend = function (fn) {
	fn(Parser);
};

extend(require('./location'));
extend(require('./tokenize'));
extend(require('./statement'));
extend(require('./parseutil'));
extend(require('./expression'));
extend(require('./lval'));

module.exports = Parser;
