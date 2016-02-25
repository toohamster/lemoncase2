var tt = require('./tokentype.js').types;

var lineBreak = require('./whitespace.js').lineBreak;

var isIdentifierStart = require('./identifier.js').isIdentifierStart;
var isIdentifierChar = require('./identifier.js').isIdentifierChar;

var getLineInfo = require('./locutil.js').getLineInfo;
var UID = require('./util.js').UID;
var genExpr = require('./walk.js');

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
		if (this.eat(tt.parenL)) {
			node.BODY.params = this.parseBindingList(tt.parenR, false, false);
		}

		//todo check var list
	};

	pp.parsePcBlock = function (node) {
		var statements = this.parseBlock();
		
		// no statements or no return
		if (!statements.length || statements[statements.length - 1].TYPE !== 0x01) {
			statements.push({
				LINE: -1,
				TYPE: 0x01,
			});
		}
		//todo check var list
		node.BODY.segment = statements;
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
			case tt._input:
				return this.parseInputAction();
			case tt._return:
				return this.parseReturnStatement();
			case tt._wait:
				return this.parseWaitStatement();
			case tt._assert:
				return this.parseAssertStatement();
			case tt._log: case tt._console:
				return this.parseLogStatement(starttype === tt._log ? 0x20 : 0x21);
			case tt._jumpto:
				return this.parseGotoStatement();
			case tt._refresh:
				return this.parseRefreshStatement();
			case tt._var:
				return this.parseVarStatement();
			case tt.name:
				return this.parseExprStatement();
			default:
				this.unexpected();
		}
	};

	pp.parseReturnStatement = function () {
		var node = this.startLCNode(0x01);

		if (this.eat(tt.semi)) node.args = null;
		else this.raise(this.start, 'Return expression is not supported');

		return node;
	};

	pp.parseVarStatement = function () {
		var node = this.startLCNode(0x10);

		this.parseVar(node);
		node.BODY.exp = genExpr(node.BODY.raw);

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
				decl.init = this.parseMaybeAssign();
			} else {
				decl.init = null;
			}

			declarations.push(decl);
			if (!this.eat(tt.comma)) break;
		}

		node.BODY.raw = {
			declarations: declarations,
			type: 'varDecl'
		};
	};
	
	pp.parseExprStatement = function () {
		var line = getLineInfo(this.input, this.start).line;
		var expr = this.parseExpression();
		
		this.semicolon();
		
		// fn()
		if (expr.type === 'CallExpr') {
			return {
				LINE: line,
				TYPE: 0x00,
				BODY: {
					identifier: expr.callee.name
				}
			};
		}
		
		// a = 1
		var fn = genExpr(expr);
		
		return {
			LINE: line,
			TYPE: 0x10,
			BODY: {
				exp: fn,
				raw: expr
			}
		}
	}
	
	pp.parseWaitStatement = function () {
		var node = this.startLCNode(0x11);
		
		node.BODY.raw = this.parseExpression();
		node.BODY.delay = genExpr(node.BODY.raw);
		
		this.semicolon();
		
		return node;
	}

	pp.parseClickAction = function (keyword) {
		var node = this.startLCNode(0x12);

		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);
		node.BODY.action = keyword;

		this.semicolon();

		return node;
	};
	
	pp.parseInputAction = function () {
		var node = this.startLCNode(0x12);
		
		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);
		
		this.expect(tt._by);
		
		node.BODY.raw1 = this.parseExpression();
		node.BODY.param = genExpr(node.BODY.raw1);
		node.BODY.action = 'input';
		
		this.semicolon();
		
		return node;
	};
	
	pp.parseAssertStatement = function () {
		var node = this.startLCNode(0x13);
		
		node.BODY.raw = this.parseExpression();
		node.BODY.exp = genExpr(node.BODY.raw);
		
		if (this.eat(tt._in)) {
			if (this.type === tt.num) {
				node.BODY.timeout = this.value;
			} else {
				this.unexpected();
			}
			
			this.next();
		}
		
		this.semicolon();
		//do not forgot the data key
		node.BODY.key = UID('#');
		this.keys.push(node.BODY.key);
		
		return node;
	}
	
	pp.parseGotoStatement = function () {
		var node = this.startLCNode(0x14);
		
		node.BODY.raw = this.parseExpression();
		node.BODY.url = genExpr(node.BODY.raw);
		
		this.semicolon();
		
		return node;
	};

	pp.parseRefreshStatement = function () {
		var node = this.startLCNode(0x15);

		this.semicolon();

		return node;
	};
	
	pp.parseLogStatement = function (type) {
		var node = this.startLCNode(type);
		
		node.BODY.raw = this.parseExpression();
		node.BODY.msg = genExpr(node.BODY.raw);
		
		this.semicolon();
		
		return node;
	};
	

	pp.startLCNode = function (type) {
		var node = {
			LINE: getLineInfo(this.input, this.start).line,
			TYPE: type,
			BODY: {}
		};
		
		this.next();
		
		return node;
	};
	
};