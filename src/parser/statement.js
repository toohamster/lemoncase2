var tt = require('./tokentype.js').types;

var lineBreak = require('./whitespace.js').lineBreak;

var isIdentifierStart = require('./identifier.js').isIdentifierStart;
var isIdentifierChar = require('./identifier.js').isIdentifierChar;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	// ### Statement parsing

	// Parse a program. Initializes the parser, reads any number of
	// statements, and wraps them in a Program node.  Optionally takes a
	// `program` argument.

	pp.parseTopLevel = function (program) {
		while (this.type !== tt.eof) {
			this.parseStructure();
		}

		return program;
	};
	
	pp.parseStructure = function () {
		var globaltype = this.type;

		if (globaltype.macro) return this.parseSet();
		if (globaltype === tt._process) return this.parseProcess();

		this.raise(this.start, 'Expect a #set or process');
	};

	pp.parseSet = function () {
		// #set ...
		var setType = this.type;

		if (!setType.macro) this.unexpected();

		var confTable = this.conf;
		var key = setType.label.substr(1).toLowerCase(); // #CLOCK --> clock

		if (confTable[key]) this.raise(this.start, this.value + ' was defined already');

		confTable[key] = this.value;

		this.next();
	};

	pp.parseProcess = function () {

	};
};