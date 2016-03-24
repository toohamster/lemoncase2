var getOptions = require('./options.js').getOptions;
var keywordRegexp = require('./identifier.js').keywordRegexp;
var tt = require('./tokentype.js').types;

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

	this.labels = [];

	// conf - #set
	this.conf = {};
	this.keys = {};
	this.nextID = 0;
	// keep track of process body(statements)
	this.pcs = {};
	//keep track of all the unused process/ declared process
	this.pcsTable = {};

	//dKey - dictionary field used
	//obKey - object key used
	this.dTable = {};
	this.obTable = {};
};

Parser.prototype.parse = function () {
	this.nextToken();

	var program = {
		CONFIG: this.conf,
		DATA_KEYS: this.keys,
		PROCESSES: this.pcs,

		DICTIONARY_KEYS: this.dTable,
		OBJECT_KEYS: this.obTable
	};

	return this.parseTopLevel(program);
};

var extend = function (fn) {
	fn(Parser);
};

extend(require('./location.js'));
extend(require('./tokenize.js'));
extend(require('./statement.js'));
extend(require('./parseutil.js'));
extend(require('./expression.js'));
extend(require('./lval.js'));

module.exports = Parser;
