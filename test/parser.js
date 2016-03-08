(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LP = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var tt = require('./tokentype.js').types;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	// ### Expression parsing

	// These nest, from the most general expression type at the top to
	// 'atomic', nondivisible expression types at the bottom. Most of
	// the functions will simply let the function(s) below them parse,
	// and, *if* the syntactic construct they handle is present, wrap
	// the AST node that the inner parser gave them in another node.

	// Parse a full expression. The optional arguments are used to
	// forbid the `in` operator (in for loops initalization expressions)
	// and provide reference for storing '=' operator inside shorthand
	// property assignment in contexts where both object expression
	// and object pattern might appear (so it's possible to raise
	// delayed syntax error at correct position).

	pp.parseExpression = function () {
		var expr = this.parseMaybeAssign();
		if (this.type === tt.comma) {
			var node = {
				type: 'SequenceExpr'
			};
			node.expressions = [expr];

			while (this.eat(tt.comma)) {
				var newExpr = this.parseMaybeAssign();
				node.expressions.push(newExpr);
			}

			return node;
		}

		return expr;
	};

	// Parse an assignment expression. This includes applications of
	// operators like `+=`.

	pp.parseMaybeAssign = function () {
		var left = this.parseMaybeConditional();

		if (this.type.isAssign) {
			var node = {
				type: 'AssignmentExpr',
				left: left,
				operator: this.value
			};

			this.next();

			node.right = this.parseMaybeAssign();

			return node;
		}

		return left;
	};

	// Parse a ternary conditional (`?:`) operator.

	pp.parseMaybeConditional = function () {


		// maybe we will need '?' in the future?

		return this.parseExprOps();
	};

	// Start the precedence parser.

	pp.parseExprOps = function () {
		var startPos = this.start;
		var expr = this.parseMaybeUnary(false);

		return this.parseExprOp(expr, startPos, -1);
	};

	// Parse binary operators with the operator precedence parsing
	// algorithm. `left` is the left-hand side of the operator.
	// `minPrec` provides context that allows the function to stop and
	// defer further parser to one of its callers when it encounters an
	// operator that has a lower precedence than the set it is parsing.

	pp.parseExprOp = function (left, leftStartPos, minPrec) {
		var prec = this.type.binop;

		if (prec != null) {
			if (prec > minPrec) {
				var type = this.type;
				var op = this.value;
				this.next();
				var startPos = this.start;
				var right = this.parseExprOp(this.parseMaybeUnary(false), startPos, prec);
				var node = this.buildBinary(leftStartPos, left, right, op, type);

				return this.parseExprOp(node, leftStartPos, minPrec);
			}
		}

		return left;
	};

	pp.buildBinary = function (startPos, left, right, op, type) {
		var node = {
			left: left,
			operator: op,
			right: right
		};

		if (type === tt.logicalAND || type === tt.logicalOR) node.type = 'LogicalExpr';
		else if (type === tt.match) node.type = 'MatchExpr';
		else node.type = 'BinaryExpr';

		return node;
	};

	pp.parseMaybeUnary = function (sawUnary) {
		var expr;
		if (this.type.prefix) {
			var node = {}, update = this.type === tt.incDec;
			node.operator = this.value;
			node.prefix = true;

			this.next();

			node.argument = this.parseMaybeUnary(false);

			if (update) {

			} else {
				sawUnary = true;
			}

			node.type = update ? 'UpdateExpr' : 'UnaryExpr';

			expr = node;
		} else {
			expr = this.parseExprSubscripts();

			while (this.type.postfix) {
				var out = {};
				out.operator = this.value;
				out.prefix = false;
				out.argument = expr;

				this.next();

				out.type = 'UpdateExpr';
				expr = out;
			}
		}

		return expr;
	};

	pp.parseExprSubscripts = function () {
		var startPos = this.start;
		var expr = this.parseExprAtom();

		return this.parseSubscripts(expr, startPos);
	};

	pp.parseSubscripts = function (base, startPos) {
		for (;;) {
			if (this.eat(tt.parenL)) {
				var node = {
					type: 'CallExpr',
					callee: base
				};

				this.expect(tt.parenR);
				
				return node;
			} else {
				return base;
			}
		}
	};

	// Parse an atomic expression — either a single token that is an
	// expression, an expression started by a keyword like `function` or
	// `new`, or an expression wrapped in punctuation like `()`, `[]`,
	// or `{}`.

	pp.parseExprAtom = function () {
		var node;

		switch (this.type) {
			case tt.name:
				var name = this.parseIndent(this.type !== tt.name);
				return { type: 'Identifier', name: name };

			case tt.regexp:
				var value = this.value;
				node = this.parseLiteral('regexp');
				node.regexp = value;

				return node;

			case tt.num: case tt.string:
				return this.parseLiteral('literal', this.value);
			
			case tt.objectAt: case tt.dict:
				return this.parseExtLiteral(this.type);

			case tt.parenL:
				return this.parseParenExpression();

			case tt.tagAtL: case tt.tagNumL:
				return this.parseTagExpression();

			default:
				this.unexpected();
		}
	};

	pp.parseLiteral = function (type, value) {
		var node = {
			type: type,
			value: value,
			raw: this.input.slice(this.start, this.end)
		};

		this.next();

		return node;
	};
	
	pp.parseExtLiteral = function (type) {
		var node = {
			type: type.label,
			value: this.value
		};
		
		this.next();
		
		return node;
	};

	pp.parseParenExpression = function () {
		this.expect(tt.parenL);
		var val = this.parseExpression();
		this.expect(tt.parenR);

		return {
			type: 'ParenthesizedExpr',
			expression: val
		};
	};

	pp.parseTagExpression = function () {
		var node = {
			type: this.type === tt.tagAtL ? 'TextExpr' : 'CountExpr'
		};

		this.next();
		node.val = this.parseExpression();
		this.expect(tt.tagR);

		return node;
	};

	pp.parseIndent = function () {
		var name;

		if (this.type === tt.name) {
			name = this.value;
		} else {
			this.unexpected();
		}

		this.next();

		return name;
	}
};
},{"./tokentype.js":12}],2:[function(require,module,exports){
// the keywords
var reserve = ["in", "by"];
var actions = ["click", "input", "rclick", "dblclick",
	"movein", "moveout", "scroll", "select", 'jumpto', 'refresh'];
var macros = ['#CLOCK', '#TIMES', '#INTERVAL', '#SCREEN'];

var keywords = ['wait', 'assert', 'log', 'console', 'var', 'process',
'return'].concat(reserve).concat(actions).concat(macros);

var keywordRegexp = new RegExp('^(' + keywords.join('|') + ')$');

function isIdentifierStart(code) {
	if (code < 65) return code === 36;//$
	if (code < 91) return true;//A-Z
	if (code < 97) return code === 95;//_
	return code < 123;//a-z
}

function isIdentifierChar(code) {
	if (code < 48) return code === 36;//$
	if (code < 58) return true;//0-9
	if (code < 65) return false;
	if (code < 91) return true;//A-Z
	if (code < 97) return code === 95;//_
	return code < 123;//a-z
}

module.exports = {
	keywordRegexp: keywordRegexp,
	isIdentifierStart: isIdentifierStart,
	isIdentifierChar: isIdentifierChar
};
},{}],3:[function(require,module,exports){
var Parser = require('./state.js');

module.exports = {
	parse: function (input, options) {
		return new Parser(options, input).parse();
	},
	tokenizer: function (input, options) {
		return new Parser(options, input);
	}
};
},{"./state.js":9}],4:[function(require,module,exports){
var getLineInfo = require('./locutil.js').getLineInfo;
var empowerErrMsg = require('./locutil.js').empowerErrMsg;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

module.exports = function (Parser) {
	var pp = Parser.prototype;

	pp.raise = function (pos, msg) {
		var loc = getLineInfo(this.input, pos);
		msg += ' (' + loc.line + ':' + loc.column + ')';
		msg = empowerErrMsg(this.input, loc, msg);
		var err = new SyntaxError(msg);
		err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
		throw err;
	};
};
},{"./locutil.js":5}],5:[function(require,module,exports){
var lineBreakG = require('./whitespace.js').lineBreakG;

var Position = function (line, col) {
	this.line = line;
	this.column = col;
};

Position.prototype.offset = function (n) {
	return new Position(this.line, this.column + n);
};

// determine the position of error
function getLineInfo(input, offset) {
	for (var line = 1, cur = 0;;) {
		lineBreakG.lastIndex = cur;
		var match = lineBreakG.exec(input);
		if (match && match.index < offset) {
			++line;
			cur = match.index + match[0].length;
		} else {
			return new Position(line, offset - cur);
		}
	}
}

// provide better error message

function empowerErrMsg (input, loc, msg) {
	var errLine = input.split(lineBreakG)[loc.line - 1];
	var strBeforeErr = errLine.substr(0, loc.column);
	var width = widthOf(strBeforeErr);
	
	var arrow = genArrow(width);
	var positionedMsg = positionMsg(msg, width);
	
	return '\n' + errLine + '\n' + arrow + '\n' + positionedMsg;
}

function genArrow (width) {
	var i = -1, j = -1, out = '';
	
	while (++i < width) {
		out += ' ';
	}
	
	out += '↑\n';
	
	while (++j < width) {
		out += ' ';
	}
	
	out += '↑';
	
	return out;
}

function positionMsg (msg, width) {
	// very long message, no need to reposition
	if (msg.length / 2 > width) {
		return msg;
	}
	
	var i = -1, emptyWidth = width - Math.floor(msg.length / 2), newMsg = '';
	
	while (++i < emptyWidth) {
		newMsg += ' ';
	}
	
	newMsg += msg;
	
	return newMsg;
}

// calculate width of string
function widthOf (str) {
	var code, 
		width = 0,
		i = -1, len = str.length;
		
	while (++i < len) {
		code = str.charCodeAt(i);
		
		switch (code) {
			case 9: // '\t'
				width += 4;
				break;
			default:
				width += 1;
				break;
		}
	}
	
	return width;
}

module.exports = {
	getLineInfo: getLineInfo,
	empowerErrMsg: empowerErrMsg
};
},{"./whitespace.js":15}],6:[function(require,module,exports){
var tt = require('./tokentype.js').types;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	pp.parseBindingList = function (close, allowEmpty, allowTrailingComma) {
		var elts = [], first = true;

		while (!this.eat(close)) {
			if (first) first = false;
			else this.expect(tt.comma);

			if (allowEmpty && this.type === tt.comma) {
				elts.push(null);
			} else if (allowTrailingComma) {
				break;
			} else {
				var elem = this.parseIndent();

				elts.push(elem);
			}
		}

		return elts;
	}
};
},{"./tokentype.js":12}],7:[function(require,module,exports){
var has = require('./util.js').has;

var defaultOptions = {
	insertReturn: true,
	onComment: function (){},
	plugins: {}
};

function getOptions (options) {
	var result = {};
	for (var op in defaultOptions) {
		result[op] = options && has(options, op) ? options[op] : defaultOptions[op];
	}

	return result;
}

module.exports = {
	defaultOptions: defaultOptions,
	getOptions: getOptions
};
},{"./util.js":13}],8:[function(require,module,exports){
var tt = require('./tokentype.js').types;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	pp.eat = function (type) {
		if (this.type === type) {
			this.next();
			return true;
		}

		return false;
	};

	pp.semicolon = function () {
		if (!this.eat(tt.semi)) this.expected(tt.semi);
	};

	pp.expect = function (type) {
		this.eat(type) || this.expected(type);
	};

	pp.unexpected = function (pos) {
		this.raise(pos != null ? pos : this.start, 'Unexpected token');
	};
	
	pp.expected = function (type) {
		this.raise(this.lastTokEnd, 'Expect a "' + type.label + '" after');
	};
	
	pp.UID = function (string) {
		return string + this.nextID++;
	};
};
},{"./tokentype.js":12}],9:[function(require,module,exports){
var getOptions = require('./options.js').getOptions;
var keywordRegexp = require('./identifier.js').keywordRegexp;
var tt = require('./tokentype.js').types;

var Parser = function (options, input) {
	this.options  = getOptions(options);
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
},{"./expression.js":1,"./identifier.js":2,"./location.js":4,"./lval.js":6,"./options.js":7,"./parseutil.js":8,"./statement.js":10,"./tokenize.js":11,"./tokentype.js":12}],10:[function(require,module,exports){
var tt = require('./tokentype.js').types;

var lineBreak = require('./whitespace.js').lineBreak;

var isIdentifierStart = require('./identifier.js').isIdentifierStart;
var isIdentifierChar = require('./identifier.js').isIdentifierChar;

var getLineInfo = require('./locutil.js').getLineInfo;
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

		this.raise(this.start, 'Expect a #set or process');
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
		}
		
		confTable[key] = val;
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
		var starttype = this.type, node = this.startNode();

		switch (starttype) {
			case tt._click: case tt._rclick: case tt._dblclick:
			case tt._movein: case tt._moveout:
				return this.parseMouseAction(node, starttype.keyword);
			case tt._select:
				return this.parseSelectAction();
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
				return this.parseLogStatement(node, starttype === tt._log ? 0x20 : 0x21);
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

		return this.finishNode(node, 0x01);
	};

	pp.parseVarStatement = function (node) {
		this.next();

		this.parseVar(node);
		node.BODY.exp = genExpr(node.BODY.raw);

		this.semicolon();

		return this.finishNode(node, 0x10);
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
			
			return this.finishNode(node, 0x00);
		}
		
		// a = 1
		var fn = genExpr(expr);
		
		node.BODY.raw = expr;
		node.BODY.exp = fn;
		
		return this.finishNode(node, 0x10);
	}
	
	pp.parseWaitStatement = function (node) {
		this.next();
		
		node.BODY.raw = this.parseExpression();
		node.BODY.delay = genExpr(node.BODY.raw);
		
		this.semicolon();
		
		return this.finishNode(node, 0x11);
	}

	pp.parseMouseAction = function (node, keyword) {
		this.next();

		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);
		node.BODY.action = keyword;

		this.semicolon();

		return this.finishNode(node, 0x12);
	};
	
	pp.parseScrollAction = function (node, keyword) {
		this.next();
		
		node.BODY.raw = this.parseExpression();
		node.BODY.object = genExpr(node.BODY.raw);
		
		this.expect(tt._by);
		
		node.BODY.raw1 = this.parseExpression();
		node.BODY.param = genExpr(node.BODY.raw1);
		
		node.BODY.action = keyword;
		
		return this.finishNode(node, 0x12);
	};
	
	pp.parseSelectAction = function () {
		this.raise('work in progress...');
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
		
		return this.finishNode(node, 0x12);
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
		
		return this.finishNode(node, 0x13);
	}
	
	pp.parseGotoStatement = function (node) {
		this.next();
		
		node.BODY.raw = this.parseExpression();
		node.BODY.url = genExpr(node.BODY.raw);
		
		this.semicolon();
		
		return this.finishNode(node, 0x14);
	};

	pp.parseRefreshStatement = function (node) {
		this.next();

		this.semicolon();

		return this.finishNode(node, 0x15);
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
		}
	};
	
	pp.finishNode = function (node, type) {
		node.TYPE = type;
		node.end = this.lastTokEnd;
		
		return node;
	};
};
},{"./identifier.js":2,"./locutil.js":5,"./tokentype.js":12,"./walk.js":14,"./whitespace.js":15}],11:[function(require,module,exports){
var isIdentifierStart = require('./identifier.js').isIdentifierStart;
var isIdentifierChar = require('./identifier.js').isIdentifierChar;

var tt = require('./tokentype.js').types;
var keywordTypes = require('./tokentype.js').keywordTypes;

var isNewLine = require('./whitespace.js').isNewLine;
var lineBreak = require('./whitespace.js').lineBreak;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	pp.next = function () {
		this.lastTokEnd = this.end;
		this.lastTokStart = this.start;

		this.nextToken();
	};

	pp.nextToken = function () {
		this.skipSpace();

		this.start = this.pos;
		if (this.pos >= this.input.length) return this.finishToken(tt.eof);

		this.readToken(this.fullCharCodeAtPos());
	};

	pp.readToken = function (code) {
		// Identifier or keyword, #set is keyword so '#' count also
		if (isIdentifierStart(code) || code === 35) {
			return this.readWord();
		}

		return this.getTokenFromCode(code);
	};

	pp.fullCharCodeAtPos = function () {
		return this.input.charCodeAt(this.pos);
	};

	pp.skipBlockComment = function () {
		var start = this.pos, end = this.input.indexOf('*/', this.pos += 2);
		if (end === -1) this.raise(this.pos - 2, 'unterminated comment');
		this.pos = end + 2;

		if (this.options.onComment) {
			this.options.onComment(true, this.input.slice(start+2, end),
				start, this.pos);
		}
	};

	pp.skipLineComment = function (startSkip) {
		var start = this.pos;
		var ch = this.input.charCodeAt(this.pos+=startSkip);
		while (this.pos < this.input.length && ch !== 10 && ch !== 13
			&& ch !== 8232 && ch !== 8233) {
			++this.pos;
			ch = this.input.charCodeAt(this.pos);
		}

		if (this.options.onComment) {
			this.options.onComment(false, this.input.slice(start+=startSkip, this.pos),
				start, this.pos);
		}
	};

	// Called at the start of the parse and after every token. Skips
	// whitespace and comments
	pp.skipSpace = function () {
		loop: while (this.pos < this.input.length) {
			var ch = this.input.charCodeAt(this.pos);
			switch (ch) {
				case 32: case 160: // ' '
				++this.pos;
				break;
				case 13:
					if (this.input.charCodeAt(this.pos + 1) === 10) {
						++this.pos;
					}
				case 10: case 8232: case 8233: //new line
				++this.pos;
				break;
				case 47: // '/'
					switch (this.input.charCodeAt(this.pos + 1)) {
						case 42: // '*'
							this.skipBlockComment();
							break;
						case 47:
							this.skipLineComment(2);
							break;
						default:
							break loop;
					}
					break;
				default:
					if (ch > 8 && ch < 14) {
						++this.pos;
					} else {
						break loop;
					}
			}
		}
	};

	pp.readToken_bracket = function () {
		var start = this.pos++;//
		var next = this.fullCharCodeAtPos();

		if (isIdentifierStart(next)) {
			var name = this.readWord1();
			next = this.fullCharCodeAtPos();
			// ']'
			if (next !== 93) this.raise(start, 'Unterminated dictionary index');
			this.pos++;
			// mark it in dictionary conf
			this.dTable[name] = true;

			return this.finishToken(tt.dict, name);
		}

		return this.finishToken(tt.bracketL);
	};

	pp.readToken_brace = function () {
		var start = this.pos++;
		var next = this.fullCharCodeAtPos();

		if (isIdentifierStart(next)) {
			var name = this.readWord1();
			next = this.fullCharCodeAtPos();
			// '}'
			if (next !== 125) this.raise(start, 'Unterminated object store index');
			this.pos++;
			//mark it in ob conf
			this.obTable[name] = true;

			return this.finishToken(tt.objectAt, name);
		}

		return this.finishToken(tt.braceL);
	};

	pp.readToken_slash = function () {
		var next = this.input.charCodeAt(this.pos+1);
		if (this.exprAllowed) {
			++this.pos;

			return this.readRegexp('/');
		}
		// '/='
		if (next === 61) return this.finishOp(tt.assign, 2);
		// '/>'
		else if (next === 62) return this.finishOp(tt.tagR, 2);

		return this.finishOp(tt.slash, 1);
	};

	pp.readToken_mult_modulo_exp = function (code) {
		var next = this.input.charCodeAt(this.pos+1);
		var size = 1;
		var type = code === 42 ? tt.star : tt.modulo;

		if (next === 61) return this.finishOp(tt.assign, size + 1);
		return this.finishOp(type, size);
	};

	pp.readToken_pipe_amp = function (code) {
		var next = this.input.charCodeAt(this.pos+1);
		if (this.exprAllowed) {
			++this.pos;

			return this.readRegexp('|');
		}
		// '&&' '||'
		if (next === code) return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2);

		this.raise(this.pos, 'bitwise operator is not allowed');
	};

	pp.readToken_plus_min = function (code) {
		var next = this.input.charCodeAt(this.pos+1);
		if (next === code) return this.finishOp(tt.incDec, 2);
		if (next === 61) return this.finishOp(tt.assign, 2);

		return this.finishOp(tt.plusMin, 1);
	};

	pp.readToken_lt_gt = function (code) {
		var next = this.input.charCodeAt(this.pos+1);
		var size = 1;
		if (next === code) {
			this.raise(this.pos, 'bitwise operator is not allowed');
		}
		if (code === 60) {
			if (next === 35) return this.finishOp(tt.tagNumL, 2); // '#'
			if (next === 64) return this.finishOp(tt.tagAtL, 2); // '@'
		}
		if (next === 61) size = 2;

		return this.finishOp(tt.relational, size);
	};

	pp.readToken_eq_excl = function (code) {
		var next = this.input.charCodeAt(this.pos+1);
		if (next === 126 && code === 33) return this.finishOp(tt.match, 2);
		if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos+2) === 61 ? 3 : 2);

		return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1);
	};

	pp.getTokenFromCode = function (code) {
		switch (code) {
			case 40: ++this.pos; return this.finishToken(tt.parenL);
			case 41: ++this.pos; return this.finishToken(tt.parenR);
			case 59: ++this.pos; return this.finishToken(tt.semi);
			case 44: ++this.pos; return this.finishToken(tt.comma);
			case 91:
				return this.readToken_bracket();
			case 93: ++this.pos; return this.finishToken(tt.bracketR);
			case 123:
				return this.readToken_brace();
			case 125: ++this.pos; return this.finishToken(tt.braceR);
			case 58: ++this.pos; return this.finishToken(tt.colon);

			//number
			case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: //0-9
				return this.readNumber(false);

			//string
			case 34:case 39:
				return this.readString(code);

			case 47: // '/'
				return this.readToken_slash();

			case 37: case 42: // '%*'
				return this.readToken_mult_modulo_exp(code);

			case 124: case 38: // '|&'
				return this.readToken_pipe_amp(code);

			case 43: case 45: // '+-'
				return this.readToken_plus_min(code);

			case 60: case 62: // '<>'
				return this.readToken_lt_gt(code);

			case 61: case 33: // '=!'
				return this.readToken_eq_excl(code);
			case 126: // '~~'
				var next = this.input.charCodeAt(this.pos+1);
				if (next !== 126) this.raise(this.pos, 'bitwise operator is not allowed');
				return this.finishOp(tt.match, 2);
		}

		this.raise(this.pos, 'Unexpected character "' + this.input[this.pos] + '"');
	};

	pp.finishOp = function (type, size) {
		var str = this.input.slice(this.pos, this.pos += size);

		return this.finishToken(type, str);
	};

	// Called at the end of every token. Sets `end`, `val`, and
	// maintains `context` and `exprAllowed`, and skips the space after
	// the token, so that the next one's `start` will point at the
	// right position.

	pp.finishToken = function (type, val) {
		this.end = this.pos;
		// var prevType = this.type;
		this.type = type;
		this.value = val;

		this.exprAllowed = this.type.beforeExpr;
	};

	pp.readRegexp = function (close) {
		var escaped, inClass, start = this.pos;
		for (;;) {
			if (this.pos >= this.input.length) this.raise(start, 'Unterminated regular expression');
			var ch = this.input.charAt(this.pos);
			if (lineBreak.test(ch)) this.raise(start, 'Unterminated regular expression');
			if (!escaped) {
				if (ch === '[') {
					inClass = true;
				} else if (ch === ']' && inClass) {
					inClass = false;
				} else if (ch === close && !inClass) {
					break;
				}
				escaped = ch === '\\';
			} else {
				escaped = false;
			}
			++this.pos;
		}
		var content = this.input.slice(start, this.pos);
		++this.pos;// skip '/' or '|'

		var mods = this.readWord1();
		if (mods) {
			var validFlags = /^[gim]*$/;
			if (!validFlags.test(mods)) this.raise(start, 'Invalid regular expression flag');
		}
		
		var value = {
			pattern: content,
			flags: mods,
			gen: close === '|'
		}

		return this.finishToken(tt.regexp, value);
	};

	pp.readInt = function(radix, len) {
		var start = this.pos, total = 0;
		for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
			var code = this.fullCharCodeAtPos(), val;
			if (code >= 97) val = code - 97 + 10; // a
			else if (code >= 65) val = code - 65 + 10; // A
			else if (code >= 48 && code <= 57) val = code - 48; // 0-9
			else val = Infinity;
			if (val >= radix) break;
			++this.pos;
			total = total * radix + val;
		}
		if (this.pos === start || len != null && this.pos - start !== len) return null;

		return total;
	};

	pp.readNumber = function (startsWithDot) {
		var start = this.pos, isFloat = false;
		if (!startsWithDot && this.readInt(10) === null) this.raise(start, 'Invalid Number');
		var next = this.fullCharCodeAtPos();
		if (next === 46) {// '.'
			++this.pos;
			this.readInt(10);
			isFloat = true;
			next = this.fullCharCodeAtPos();
		}
		if (next === 69 || next === 101) { //eE
			next = this.input.charCodeAt(++this.pos);
			if (next === 43 || next === 45) ++ this.pos; // +/-
			if (this.readInt(10) === null) this.raise(start, 'Invalid number');
			isFloat = true;
		}
		if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, 'Identifier directly after number');

		var str = this.input.slice(start, this.pos), val;
		if (isFloat) val = parseFloat(str);
		else val = parseInt(str, 10);

		return this.finishToken(tt.num, val);
	};

	pp.readString = function (quote) {
		var out = '', start = this.start, chunkStart = ++this.pos;
		for (;;) {
			if (this.pos >= this.input.length) this.raise(start, 'Unterminated string');
			var ch = this.fullCharCodeAtPos();
			if (ch === quote) break;
			if (ch === 92) { // '\' escape
				out += this.input.slice(chunkStart, this.pos);
				out += this.readEscapedChar();
				chunkStart = this.pos;
			} else {
				if (isNewLine(ch)) this.raise(start, 'Unterminated string');
				++this.pos;
			}
		}

		out += this.input.slice(chunkStart, this.pos++);
		return this.finishToken(tt.string, out);
	};

	pp.readEscapedChar = function () {
		var ch = this.input.charCodeAt(++this.pos);//current escaped char
		++this.pos;//next char
		switch (ch) {
			case 110: return '\n';
			case 114: return '\r';
			case 116: return '\t';
			case 98: return '\b';
			case 118: return '\u000b';
			case 102: return '\f';
			case 13: if (this.fullCharCodeAtPos() === 10) ++ this.pos; // '\r\n'
			case 10: return '';
			default:
				return String.fromCharCode(ch);
		}
	};

	pp.readWord1 = function () {
		var word = "", first = true, chunkStart = this.pos;
		while (this.pos < this.input.length) {
			var ch = this.fullCharCodeAtPos();
			if (isIdentifierChar(ch)) {
				++this.pos;
			} else if (first && ch === 35) {
				++this.pos;//for #set
			} else{
				break;
			}

			first = false;
		}
		word += this.input.slice(chunkStart, this.pos);

		return word;
	};

	// Read an identifier or keyword token
	pp.readWord = function () {
		var start = this.pos, word = this.readWord1();

		var type;
		if (this.keywords.test(word)) {
			type = keywordTypes[word];

			//macros span the whole line which makes no different from a line comment
			if (type.macro) {
				var val = this.readMacro();

				return this.finishToken(type, val);
			}
		} else {
			// #xxx is not a valid identifier
			if (word.charCodeAt(0) === 35) {
				this.raise(start, '# is only valid for # macro');
			}
			// everything else is fine
			type = tt.name;
		}

		return this.finishToken(type, word);
	};

	pp.readMacro = function () {
		var start = this.pos;
		var ch = this.fullCharCodeAtPos();
		while (this.pos < this.input.length && ch !== 10 && ch !== 13
		&& ch !== 8232 && ch !== 8233) {
			++this.pos;
			ch = this.input.charCodeAt(this.pos);
		}

		return this.input.slice(start, this.pos).trim();
	};
};
},{"./identifier.js":2,"./tokentype.js":12,"./whitespace.js":15}],12:[function(require,module,exports){
// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).

//no startsExpr or isLoop

var TokenType = function (label, conf) {
	if (conf === undefined) { conf = {} }

	this.label = label;
	this.keyword = conf.keyword;
	this.beforeExpr = !!conf.beforeExpr;
	this.isAssign = !!conf.isAssign;
	this.prefix = !!conf.prefix;
	this.postfix = !!conf.postfix;
	this.binop = conf.binop || null;
	this.macro = !!conf.macro;
};

function binop (name, prec) {
	return new TokenType(name, { beforeExpr: true, binop: prec });
}

var beforeExpr = { beforeExpr: true };
var macro = { macro: true };

var types = {
	num: new TokenType('num'),
	regexp: new TokenType('regexp'),
	string: new TokenType('string'),
	name: new TokenType('name'),
	eof: new TokenType('eof'),

	// special to lemoncase
	objectAt: new TokenType('objectStore'),
	dict: new TokenType('dictionaryIndex'),

	//punctuation token types
	bracketL: new TokenType('[', beforeExpr),
	bracketR: new TokenType(']'),
	braceL: new TokenType('{', beforeExpr),
	braceR: new TokenType('}'),
	parenL: new TokenType('(', beforeExpr),
	parenR: new TokenType(')'),
	comma: new TokenType(',', beforeExpr),
	semi: new TokenType(';', beforeExpr),
	colon: new TokenType(':', beforeExpr),
	tagNumL: new TokenType('<#', beforeExpr),
	tagAtL: new TokenType('<@', beforeExpr),
	tagR: new TokenType('/>'),

	// Operators. These carry several kinds of properties to help the
	// parser use them properly (the presence of these properties is
	// what categorizes them as operators).
	//
	// `binop`, when present, specifies that this operator is a binary
	// operator, and will refer to its precedence.
	//
	// `prefix` and `postfix` mark the operator as a prefix or postfix
	// unary operator.
	//
	// `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
	// binary operators with a very low precedence, that should result
	// in AssignmentExpression nodes.

	eq: new TokenType('=', { beforeExpr: true, isAssign: true }),
	assign: new TokenType('_=', { beforeExpr: true, isAssign: true }),
	incDec: new TokenType('++/--', { prefix: true, postfix: true }),
	prefix: new TokenType('prefix', {beforeExpr: true, prefix: true}),
	logicalOR: binop('||', 1),
	logicalAND: binop('&&', 2),
	equality: binop('==/!=', 6),
	relational: binop('</>', 7),
	plusMin: new TokenType('+/-', {beforeExpr: true, binop: 9, prefix: true}),
	modulo: binop('%', 10),
	star: binop('*', 10),
	slash: binop('/', 10),
	match: binop('~~', 6)
};

var keywords = {};

function kw(name, options) {
	options = options || {};
	options.keyword = name;
	keywords[name] = types["_" + name] = new TokenType(name, options);
}

kw('in');
kw('by', beforeExpr);
kw('click', beforeExpr);
kw('input', beforeExpr);
kw('rclick', beforeExpr);
kw('dblclick', beforeExpr);
kw('movein', beforeExpr);
kw('moveout', beforeExpr);
kw('scroll', beforeExpr);
kw('select', beforeExpr);
kw('#CLOCK', macro);
kw('#TIMES', macro);
kw('#INTERVAL', macro);
kw('#SCREEN', macro);
kw('wait', beforeExpr);
kw('assert', beforeExpr);
kw('log', beforeExpr);
kw('console', beforeExpr);
kw('var');
kw('process');
kw('return', beforeExpr);
kw('jumpto');
kw('refresh');

module.exports = {
	TokenType: TokenType,
	types: types,
	keywordTypes: keywords
};
},{}],13:[function(require,module,exports){
function isArray(obj) {
	return Object.prototype.toString.call(obj) === "[object Array]";
}

// Checks if an object has a property.

function has(obj, propName) {
	return Object.prototype.hasOwnProperty.call(obj, propName)
}

module.exports = {
	isArray: isArray,
	has: has
};
},{}],14:[function(require,module,exports){
// walk a javascript style tree and transform it into a function

var visitors = {
	varDecl: function (node, c) {
		var out = '', first = true;
		
		node.declarations.forEach(function (decl) {
			if (decl.init) {
				if (!first) out += ',';
				
				out += '$.' + decl.id + ' = ' + c(decl.init);
				
				first = false;
			}
		});
		
		return '(' + out + ')';
	},
	SequenceExpr: function (node, c) {
		var out = '', first = true;
		
		node.expressions.forEach(function (expr) {
			if (!first) out += ',';
			
			out += c(expr);
			
			first = false;
		});
		
		return '(' + out + ')';
	},
	
	// end point node
	literal: function (node, c) {
		return node.raw;
	},
	regexp: function (node, c) {
		// regex.gen
		if (node.regexp.gen) {
			var val = node.regexp;
			
			return '(/' + val.pattern + '/' + val.flags + ').gen'; 
		}
		// regular regular expression is fine...
		return '(' + node.raw + ')';
	},
	dictionaryIndex: function (node, c) {
		return 'd.' + node.value;
	},
	objectStore: function (node, c) {
		return 'o.' + node.value;
	},
	Identifier: function (node, c) {
		return '$.' + node.name;
	},
	
	// binary operator
	LogicalExpr: function (node, c) {
		return c(node.left) + node.operator + c(node.right);
	},
	BinaryExpr: function (node, c) {
		return c(node.left) + node.operator + c(node.right);
	},
	MatchExpr: function (node, c) {
		var out = '';
		
		if (node.operator === '~~') out += '!';
		
		return out + '!(' + c(node.left) + ').match(' + c(node.right) + ').length';
	},
	
	// unary
	UpdateExpr: function (node, c) {
		var inside = '$.' + node.argument;
		
		return node.prefix ? node.operator + inside : inside + node.operator;
	},
	UnaryExpr: function (node, c) {
		return node.operator + '(' + c(node.argument) + ')';
	},
	
	// assign
	AssignmentExpr: function (node, c) {
		return c(node.left) + node.operator + c(node.right);
	},
	
	// ()
	ParenthesizedExpr: function (node, c) {
		return '(' + c(node.expression) + ')';
	},
	
	TextExpr: function (node, c) {
		var inside = 'String(' + c(node.val) + ')';
		
		return 't(' + inside + ')';
	},
	CountExpr: function (node, c) {
		var inside = 'String(' + c(node.val) + ')';
		
		return 'c(' + inside + ')';
	}
};

module.exports = function genExpr (node) {
	var string = (function c(node){
		var type = node.type;
		
		return visitors[type](node, c);
	})(node);
	
	return new Function('$,o,d,c,t', 'return ' + string + ';');
};
},{}],15:[function(require,module,exports){
// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;

module.exports = {
	lineBreak: lineBreak,
	lineBreakG: new RegExp(lineBreak.source, 'g'),
	isNewLine: function isNewLine (code) {
		return code === 10 || code === 13 || code === 0x2028 || code == 0x2029;
	}
};
},{}]},{},[3])(3)
});