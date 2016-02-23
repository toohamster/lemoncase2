var tt = require('./tokentype.js').types;

var lineBreak = require('./whitespace.js').lineBreak;

var isIdentifierStart = require('./identifier.js').isIdentifierStart;
var isIdentifierChar = require('./identifier.js').isIdentifierChar;

var getLineInfo = require('./locutil.js').getLineInfo;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	// ### Statement parsing

	// Parse a program. Initializes the parser, reads any number of
	// statements, and wraps them in a Program node.  Optionally takes a
	// `program` argument.

	pp.parseTopLevel = function (program) {
		//mark main as used but uninitialized at the beginning
		var pcsTable = this.pcsTable;
		pcsTable.main = {
			start: 0,
			end: 0
		};

		while (this.type !== tt.eof) {
			this.parseStructure();
		}

		//todo check process declaration

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
		var node = {
			LINE: getLineInfo(this.input, this.start),
			TYPE: 0xAA,
			BODY: {}
		},
			pcs = this.pcs,
			pcsTable = this.pcsTable;

		this.next(); // process ...

		var name = this.parseIndent();
		pcs[name] = node;
		pcsTable[name] = false;

		this.parsePcParam(node);

		this.parsePcBlock(node);
	};

	pp.parsePcParam = function (node) {
		this.expect(tt.parenL);
		//todo check var list
		return node.BODY.params = this.parseBindingList(tt.parenR, false, false);
	};

	pp.parsePcBlock = function (node) {
		//todo check var list
		node.BODY.segment = this.parseBlock();
	};

	pp.parseBlock = function () {
		this.expect(tt.braceL);

		var args = [];

		while (!this.eat(tt.braceR)) {
			var stmt = this.parseStatement(true);
			args.push(stmt);
		}

		return args;
	};

	pp.parseStatement = function (declaration) {
		var starttype = this.type;

		switch (starttype) {
			case tt._click: case tt._rclick: case tt._dblclick:
			case tt._movein: case tt._moveout: case tt._select:
			case tt._scroll:
				return this.parseClickAction(starttype.keyword);
			case tt._return:
				return this.parseReturnStatement();
			case tt._wait:
				return this.raise(this.pos, 'todo');
			case tt._assert:
				return this.raise(this.pos, 'todo');
			case tt._log:
				return this.raise(this.pos, 'todo');
			case tt._jumpTo:
				return this.raise(this.pos, 'todo');
			case tt._refresh:
				return this.parseRefreshStatement();
			case tt._var:
				return this.parseVarStatement();
		}

		this.raise(this.start, 'Unexpected statement');
	};

	pp.parseReturnStatement = function () {
		var node = {
			LINE: getLineInfo(this.input, this.start),
			TYPE: 0x01
		};

		this.next();

		if (this.eat(tt.semi)) node.args = null;
		else this.raise(this.start, 'Return expression is not supported');

		return node;
	};

	pp.parseVarStatement = function () {
		var node = {
			LINE: getLineInfo(this.input, this.start),
			TYPE: 0x10,
			BODY: {

			}
		};

		this.next();

		this.parseVar(node);

		this.semicolon();

		return node;
	};

	//parse a list of variable declaration
	pp.parseVar = function (node) {
		var declarations = [];

		for (;;) {
			var decl = {};

			//todo check var
			decl.id = this.parseIndent();

			if (this.eat(tt.eq)) {
				decl.init = this.parseMayBeAssign()
			} else {
				decl.init = null;
			}

			declarations.push(decl);
			if (!this.eat(tt.comma)) break;
		}

		node.BODY.declarations = declarations;
	};

	pp.parseClickAction = function (keyword) {
		var node = {
			LINE: getLineInfo(this.input, this.start),
			TYPE: 0x12,
			BODY: {
				action: keyword
			}
		};

		this.next();

		node.BODY.object = this.type === tt.string ? this.value : this.raise(this.start, 'Expect a string');

		this.next();
		this.semicolon();

		return node;
	};

	pp.parseRefreshStatement = function () {
		var node = {
			LINE: getLineInfo(this.input, this.start),
			TYPE: 0x15
		};

		this.next();
		this.semicolon();

		return node;
	};
};