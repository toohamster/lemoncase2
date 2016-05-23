var tt = require('./tokentype').types;

var getLineInfo = require('./locutil').getLineInfo;
var genExpr = require('./walk');

var insDefinition = require('../instructionType');

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
			pos: 0
		};

		while (this.type !== tt.eof) {
			this.parseStructure();
		}

		for (var process in pcsTable) {
			if (pcsTable[process]) this.raise(pcsTable[process].pos, 'Invalid process call at');
		}

		//todo check process declaration

		return program;
	};

	pp.parseStructure = function () {
		var globaltype = this.type;

		if (globaltype.macro) return this.parseSet();
		if (globaltype === tt._process) return this.parseProcess();

		this.raise(this.start, 'Expect a macro or process');
	};

	pp.parseSet = function () {
		// #set ...
		var setType = this.type;

		if (!setType.macro) this.unexpected();

		var key = setType.label.substr(1).toLowerCase(); // #CLOCK --> clock

		this.writeConfig(key);

		this.next();
	};

	pp.writeConfig = function (key) {
		var val;

		var confTable = this.conf;
		if (confTable[key]) this.raise(this.start, this.type.keyword + ' was defined already');

		switch (key) {
			case "screen":
				var x, y, splitVal = this.value.split(',');
				if (splitVal.length !== 2) this.raise('Invalid arguments');
				x = ~~parseInt(splitVal[0], 10);
				y = ~~parseInt(splitVal[1], 10);
				val = {
					width: x,
					height: y
				}
				break;

			default:
				val = parseInt(this.value, 10);
				break;
		};

		confTable[key] = val;
	};

	pp.parseProcess = function () {
		var node = {
				LINE: getLineInfo(this.input, this.start),
				TYPE: insDefinition.PROCESS,
				BODY: {}
			},
			pcs = this.pcs,
			pcsTable = this.pcsTable;

		this.next(); // process ...

		var name = this.parseIndent();
		// check for process name
		if (pcs[name]) this.raise(this.start, name + ' process was defined already');
		pcs[name] = node;
		// mark it as initialized
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
		if (!statements.length || statements[statements.length - 1].TYPE !== insDefinition.RETURN) {
			statements.push({
				LINE: -1,
				TYPE: insDefinition.RETURN,
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

	pp.parseStatement = function () {
		var starttype = this.type, node = this.startNode();

		switch (starttype) {
			case tt._click: case tt._rclick: case tt._dblclick:
			case tt._movein: case tt._moveout:
				return this.parseMouseAction(node, starttype.keyword);
			case tt._select:
				return this.parseSelectAction(node);
			case tt._scroll:
				return this.parseScrollAction(node, starttype.keyword);
			case tt._input:
				return this.parseInputAction(node, starttype.keyword);
			case tt._return:
				return this.parseReturnStatement(node);
			case tt._wait:
				return this.parseWaitStatement(node);
			case tt._assert:
				return this.parseAssertStatement(node);
			case tt._log: case tt._console:
				return this.parseLogStatement(node,
					starttype === tt._log
					? insDefinition.LOG
					: insDefinition.CONSOLE);
			case tt._jumpto:
				return this.parseGotoStatement(node);
			case tt._refresh:
				return this.parseRefreshStatement(node);
			case tt._var:
				return this.parseVarStatement(node);
			case tt.name:
				return this.parseExprStatement(node);
			default:
				this.unexpected();
		}
	};

	pp.parseReturnStatement = function (node) {
		this.next();

		if (this.eat(tt.semi)) node.args = null;
		else this.raise(this.start, 'Return expression is not supported');

		return this.finishNode(node, insDefinition.RETURN);
	};

	pp.parseVarStatement = function (node) {
		this.next();

		this.parseVar(node);
		node.BODY.exp = genExpr(node.BODY.raw);

		this.semicolon();

		return this.finishNode(node, insDefinition.EXPRESSION);
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

	pp.parseExprStatement = function (node) {
		var expr = this.parseExpression();

		this.semicolon();

		// fn()
		if (expr.type === 'CallExpr') {
			var callee = expr.callee.name;
			// check for process declaration
			if (this.pcsTable[callee] !== false) {
				this.pcsTable[callee] = { pos: this.lastTokStart };
			}

			node.BODY.identifier = callee;

			return this.finishNode(node, insDefinition.CALL);
		}

		// a = 1
		var fn = genExpr(expr);

		node.BODY.raw = expr;
		node.BODY.exp = fn;

		return this.finishNode(node, insDefinition.EXPRESSION);
	};

	pp.parseWaitStatement = function (node) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.delay = genExpr(node.BODY.raw);

		this.semicolon();

		return this.finishNode(node, insDefinition.WAIT);
	};

	pp.parseMouseAction = function (node, keyword) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);
		node.BODY.action = keyword;

		this.semicolon();

		return this.finishNode(node, insDefinition.TRIGGER);
	};

	pp.parseScrollAction = function (node, keyword) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);

		this.expect(tt._by);

		node.BODY.raw1 = this.parseExpression();
		node.BODY.param = genExpr(node.BODY.raw1);

		node.BODY.action = keyword;

		return this.finishNode(node, insDefinition.TRIGGER);
	};

	pp.parseSelectAction = function (node) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);
		
		this.semicolon();
		
		return this.finishNode(node, insDefinition.TRIGGER);
	};

	pp.parseInputAction = function (node, keyword) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);

		this.expect(tt._by);

		node.BODY.raw1 = this.parseExpression();
		node.BODY.param = genExpr(node.BODY.raw1);
		node.BODY.action = keyword;

		this.semicolon();

		return this.finishNode(node, insDefinition.TRIGGER);
	};

	pp.parseAssertStatement = function (node) {
		this.next();

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
		node.BODY.key = this.UID('#');
		this.keys[node.BODY.key] = node.BODY.timeout ? true : false;

		return this.finishNode(node, insDefinition.ASSERT);
	};

	pp.parseGotoStatement = function (node) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.url = genExpr(node.BODY.raw);

		this.semicolon();

		return this.finishNode(node, insDefinition.JUMPTO);
	};

	pp.parseRefreshStatement = function (node) {
		this.next();

		this.semicolon();

		return this.finishNode(node, insDefinition.REFRESH);
	};

	pp.parseLogStatement = function (node, type) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.msg = genExpr(node.BODY.raw);

		this.semicolon();

		return this.finishNode(node, type);
	};

	pp.startNode = function () {
		return {
			LINE: getLineInfo(this.input, this.start).line,
			TYPE: 0,
			BODY: {},
			start: this.start,
			end: 0
		};
	};

	pp.finishNode = function (node, type) {
		node.TYPE = type;
		node.end = this.lastTokEnd;

		return node;
	};
};
