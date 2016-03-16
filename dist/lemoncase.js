/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "debug/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var parse = __webpack_require__(2).parse,
		Case = __webpack_require__(17).Case,
		setup = __webpack_require__(20).setup,
		IF = __webpack_require__(19),
		Dictionary = __webpack_require__(22),
		init = __webpack_require__(20).init,
		getLemoncaseFrame = __webpack_require__(20).getLemoncaseFrame;

	__webpack_require__(23);
	__webpack_require__(24);
	__webpack_require__(25);
		
	window.getLemoncaseFrame = getLemoncaseFrame;
	window.Dictionary = Dictionary;
	window.init = init;
	window.setup = setup;
	window.parse = parse;
	window.Case = Case;

	var exports = {
		Case: Case,
		setup: setup,
		Instruction: IF,
		parse: parse,
		Dictionary: Dictionary,
		init: init,
		getLemoncaseFrame: getLemoncaseFrame
	};

	if (typeof angular !== 'undefined') {
		angular.module('lemoncase', []).provider('LC', function () {
			this.setup = exports.setup;

			this.$get = [function () {
				return exports;
			}];
		});
	}

	module.exports = exports;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Parser = __webpack_require__(3);

	module.exports = {
		parse: function (input, options) {
			return new Parser(options, input).parse();
		},
		tokenizer: function (input, options) {
			return new Parser(options, input);
		}
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var getOptions = __webpack_require__(4).getOptions;
	var keywordRegexp = __webpack_require__(6).keywordRegexp;
	var tt = __webpack_require__(7).types;

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

	extend(__webpack_require__(8));
	extend(__webpack_require__(11));
	extend(__webpack_require__(12));
	extend(__webpack_require__(14));
	extend(__webpack_require__(15));
	extend(__webpack_require__(16));


	module.exports = Parser;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var has = __webpack_require__(5).has;

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

/***/ },
/* 5 */
/***/ function(module, exports) {

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

/***/ },
/* 6 */
/***/ function(module, exports) {

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

/***/ },
/* 7 */
/***/ function(module, exports) {

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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var getLineInfo = __webpack_require__(9).getLineInfo;
	var empowerErrMsg = __webpack_require__(9).empowerErrMsg;

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

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var lineBreakG = __webpack_require__(10).lineBreakG;

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

/***/ },
/* 10 */
/***/ function(module, exports) {

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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var isIdentifierStart = __webpack_require__(6).isIdentifierStart;
	var isIdentifierChar = __webpack_require__(6).isIdentifierChar;

	var tt = __webpack_require__(7).types;
	var keywordTypes = __webpack_require__(7).keywordTypes;

	var isNewLine = __webpack_require__(10).isNewLine;
	var lineBreak = __webpack_require__(10).lineBreak;

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
				isGenerate: close === '|'
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

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var tt = __webpack_require__(7).types;

	var lineBreak = __webpack_require__(10).lineBreak;

	var isIdentifierStart = __webpack_require__(6).isIdentifierStart;
	var isIdentifierChar = __webpack_require__(6).isIdentifierChar;

	var getLineInfo = __webpack_require__(9).getLineInfo;
	var genExpr = __webpack_require__(13);

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

/***/ },
/* 13 */
/***/ function(module, exports) {

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
			if (node.regexp.isGenerate) {
				var val = node.regexp;
				
				return '(/' + val.pattern + '/' + val.flags + ').gen()';
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


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var tt = __webpack_require__(7).types;

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

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var tt = __webpack_require__(7).types;

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

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var tt = __webpack_require__(7).types;

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

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint plusplus: true, sloppy: true, nomen: true */
	var CALL = __webpack_require__(18).CALL,
		EXIT = __webpack_require__(18).EXIT,
		_ = __webpack_require__(20)['_'],
		settings = __webpack_require__(20).settings,
		Collector = __webpack_require__(21),
		IF = __webpack_require__(19);

	function linker(syntaxTree, object, dictionary, $case) {
		var eT = {
			process: {},
			config: {}
		}, dk = [];

		_.forEach(syntaxTree.DATA_KEYS, function (isWatched, key) {
			if (isWatched) {
				dk.push(key);
			}
		});

		_.forEach(syntaxTree.DICTIONARY_KEYS, function (v, fieldName) {
			if (!dictionary.isFieldDefined(fieldName)) {
				throw new Error('The field: ' + fieldName + ' is undefined in dictionary.');
			}
		});

		_.forEach(syntaxTree.OBJECT_KEYS, function (v, objectName) {
			if (!object.hasOwnProperty(objectName)) {
				throw new Error('The key: ' + objectName + ' is undefined in object.');
			}
		});

		_.forEach(syntaxTree.PROCESSES, function (prcOpts, prcName) {
			var prc = eT.process[prcName] = [];
			_.forEach(prcOpts.BODY.segment, function (insOpts) {
				prc.push(IF(insOpts.TYPE).$new(insOpts, $case));
			});
		});

		eT.config.times = syntaxTree.CONFIG.times;
		eT.config.interval = syntaxTree.CONFIG.interval;
		eT.config.screen = syntaxTree.CONFIG.screen;


		return {
			eT: eT,
			dK: dk
		};
	}
	function Case(syntaxTree, object, dictionary) {
		if (!(this instanceof Case)) {
			return new Case(syntaxTree);
		}

		var link = linker(syntaxTree, object, dictionary, this);
		// executionTree
		this.$$executionTree = link.eT;

		// Outside object.
		this.$dictionary = dictionary;
		this.$objectList = object;
		this.$$log = new Collector(link.dK);

		// states
		this.$$state = 'ready';
		this.$$coreId = null;
		this.$$activeTime = 0;
		this.$$currentLoop = 0;

		// stacks
		this.$$blockStack = []; // {counter, segment}
		this.$$scopeStack = []; // {blockIndex, vars}

		// buffer
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

		if (this.hasDictionary()) {
			this.$loopData = this.$dictionary.load(this.$$getConfig('times')).fetch();
		}

		if (srnOpt) {
			frm.height = srnOpt.height + 'px';
			frm.width = srnOpt.width + 'px';
		}

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
			settings.runCallback.call(this);
		} catch (error) {
			console.error(error);
			settings.runExceptionHandle.call(this, error);
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

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint sloppy: true, nomen: true */

	var IF = __webpack_require__(19),
		settings = __webpack_require__(20).settings,
		_ = __webpack_require__(20)['_'];	

	var CALL = 0x00,
		RETURN = 0x01,
		EXIT = 0x02,

		EXPRESSION = 0x10,
		WAIT = 0x11,
		TRIGGER = 0x12,
		ASSERT = 0x13,
		JUMPTO = 0x14,
		REFRESH = 0x15,

		LOG = 0x20,
		CONSOLE = 0x21,

		PASSED = 1,
		FAILURE = 0;

	IF(CALL, {
		operation: function Call() {
			var identifier = this.body('identifier');

			this.$case
				.$pushScope(identifier)
				.$pushLog([CALL, identifier], this.line());
		},
		bodyFactory: function (name) {
			return {
				identifier: name
			};
		}
	});
	IF(RETURN, {
		operation: function Return() {
			this.$case
				.$pushLog([RETURN])
				.$popScope();
		},
		bodyFactory: function () {
			return {};
		}
	});
	IF(EXIT, {
		operation: function Exit() {
			var flag = this.body('isSuccess') ? PASSED : FAILURE,
				CASE = this.$case;

			CASE.$pushLog([EXIT, flag], this.line())
				.$markLog(flag, CASE.getCurrentLoop())
				.$clearScope()
				.$exitLoop();
		},
		bodyFactory: function (isSuccess) {
			return {
				isSuccess: isSuccess
			};
		}
	});

	IF(EXPRESSION, {
		operation: function Expression() {
			this.$case.$runExp(this.body('exp'));
		},
		bodyFactory: function (expFn) {
			return {
				exp: expFn
			};
		}
	});
	IF(WAIT, {
		operation: function Wait() {
			var delay = this.$case.$runExp(this.body('delay'));

			this.$case
				.$setActiveTime(delay)
				.$pushLog([WAIT, delay], this.line());
		},
		bodyFactory: function (delay) {
			return {
				delay: delay
			};
		}
	});
	IF(TRIGGER, {
		operation: function Trigger() {
			var cssPath = this.$case.$runExp(this.body('object')),
				param = {
					value: this.$case.$runExp(this.body('param'))
				},
				action = this.body('action'),
				DOM = _.document().querySelectorAll(cssPath)[0];

			if (!DOM) {
				this.$case
					.$pushLog([TRIGGER, FAILURE, cssPath, action, param], this.line())
					.$setTempInstruction(IF(EXIT).create(false).assignCase(this.$case));

				console.log('Can not find a DOM by cssPath: ' + cssPath);
				return;
			}

			trigger(DOM).does(action, param);
			settings.triggerCallback.call(this.$case, DOM);

			this.$case
				.$pushLog([TRIGGER, PASSED, cssPath, action, param], this.line());
		},
		bodyFactory: function (object, action, param) {
			return {
				object: object,
				action: action,
				param: param
			};
		}
	});
	IF(ASSERT, {
		operation: function Assert() {
			var startTime = _.now(),
				exp = this.body('exp'),
				timeout = this.body('timeout'),
				CASE = this.$case,
				ins = this;

			function queryHTMLElementByCSS() {
				// Call when timeout defined, and cancel temp instruction
				// when assert success.
				if (!CASE.$runExp(exp)) {
					return;
				}

				CASE.$setIdleTask()
					.$setTempInstruction()
					.$setActiveTime()
					.$pushLog([ASSERT, PASSED], ins.line())
					.$pushLogData(ins.body('key'), _.now() - startTime);
			}

			CASE.$setTempInstruction(IF(EXIT).create(false).assignCase(CASE));

			if (timeout && timeout > 2 * settings.defaultClock) {
				CASE.$setActiveTime(timeout)
					.$setIdleTask(queryHTMLElementByCSS);
			}

			if (CASE.$runExp(exp)) {
				// whatever timeout defined or not, it must be
				// asserted at first. So canel IdleTask & tempInstruction
				// when assert success.
				CASE.$setTempInstruction()
					.$setActiveTime()
					.$setIdleTask()
					.$pushLog([ASSERT, PASSED], this.line());

				if (timeout) {
					CASE.$pushLogData(ins.body('key'), 0);
				}
			} else if (!timeout) {
				CASE.$pushLog([ASSERT, FAILURE], this.line());
			}
		},
		bodyFactory: function (exp, timeout, dataKey) {
			return {
				exp: exp,
				timeout: timeout,
				key: dataKey
			};
		}
	});
	IF(JUMPTO, {
		operation: function JumpTo() {
			var url = this.$case.$runExp(this.body('url'));
			settings.contextFrame.src = url;
			this.$case.$pushLog([JUMPTO, url], this.line());
		}
	});
	IF(REFRESH, {
		operation: function Refresh() {
			settings.contextFrame.src = _.document().location.href;
			this.$case.$pushLog([REFRESH], this.line());
		}
	});

	IF(LOG, {
		operation: function Log() {
			this.$case.$pushLog([LOG, this.$case.$runExp(this.body('msg'))]);
		},
		bodyFactory: function (msg) {
			return {
				msg: msg
			};
		}
	});
	IF(CONSOLE, {
		operation: function Console() {
			var msg = this.$case.$runExp(this.body('msg'));
			console.log(msg);
			settings.consoleFn(msg);
		},
		bodyFactory: function (msg) {
			return {
				msg: msg
			};
		}
	});

	module.exports = {
		CALL: CALL,
		RETURN: RETURN,
		EXIT: EXIT,
		EXPRESSION: EXPRESSION,
		WAIT: WAIT,
		TRIGGER: TRIGGER,
		ASSERT: ASSERT,
		JUMPTO: JUMPTO,
		REFRESH: REFRESH,
		LOG: LOG,
		CONSOLE: CONSOLE
	}

/***/ },
/* 19 */
/***/ function(module, exports) {

	/*jslint vars: true, sloppy: true, nomen: true */
	var IF = function InstructionFactory(TYPE, opts) {
		if (!opts) {
			var IF = instructionFactories[TYPE];
			if (!IF) {
				throw new Error('TYPE:' + TYPE + ' instruction is not existed.');
			}
			return IF;
		}

		if (instructionFactories[TYPE]) {
			throw new Error('The instruction factory: TYPE=' + TYPE + ' is existed.');
		}

		function Instruction(opts, $case) {
			this.$case = $case;
			this.$body = opts.BODY;
			this.$line = opts.LINE;
		}
		Instruction.prototype.execute = opts.operation;
		Instruction.prototype.line = function () {
			return this.$line;
		};
		Instruction.prototype.body = function (key) {
			if (key) {
				return this.$body[key];
			}
			return this.$body;
		};
		Instruction.prototype.assignCase = function ($case) {
			this.$case = $case;

			return this;
		};
		Instruction.create = function () {
			return new Instruction({
				BODY: opts.bodyFactory.apply(null, arguments)
			});
		};
		Instruction.$new = function (opts, $case) {
			return new Instruction(opts, $case);
		};

		instructionFactories[TYPE] = Instruction;

		return Instruction;
	}, instructionFactories = [];

	module.exports = IF;

/***/ },
/* 20 */
/***/ function(module, exports) {

	/*jslint vars: true, sloppy: true, nomen: true */
	var callMainIns, exitIns, _, settings, setup;

	_ = {
		now: Date.now || function () {
			return new Date().getTime();
		},
		isString: function (string) {
			return typeof string === 'string';
		},
		isUndefined: function (value) {
			return value === void 0;
		},
		isDefined: function (value) {
			return !_.isUndefined(value);
		},
		isNumber: function (value) {
			return typeof value === 'number';
		},
		isObject: function (obj) {
			var type = typeof obj;
			return type === 'function' || (type === 'object' && !!obj);
		},
		isElement: function (obj) {
			return !!(obj && obj.nodeType === 1);
		},
		isFunction: function (obj) {
			return typeof obj === 'function';
		},
		isArray: function (obj) {
			return ({}).toString.call(obj) === '[object Array]';
		},
		last: function (array) {
			return array[array.length - 1];
		},
		noop: function () {},
		forEach: function (obj, iteratee, context) {
			iteratee = iteratee.bind(context);
			var i, length;
			if (this.isArray(obj)) {
				for (i = 0, length = obj.length; i < length; i += 1) {
					iteratee(obj[i], i, obj);
				}
			} else {
				var keys = Object.keys(obj);
				for (i = 0, length = keys.length; i < length; i += 1) {
					iteratee(obj[keys[i]], keys[i], obj);
				}
			}
			return obj;
		},
		document: function () {
			if (settings.contextFrame) {
				return settings.contextFrame.contentWindow.document;
			}
			return document;
		},
		countDOM: function (cssPath) {
			return _.document().querySelectorAll(cssPath).length;
		},
		getInnerHTML: function (cssPath) {
			var DOM = _.document().querySelector(cssPath);
			if (DOM) {
				return DOM[DOM.value ? 'value' : 'innerHTML'];
			}
			return 'Error:No such HTMLElement.';
		}
	};

	settings = {
		contextFrame: document.createElement('iframe'),
		defaultNextLoopDelay: 3000,
		readyTimeout: 3000,
		defaultClock: 10,
		bootExceptionHandle: _.noop,
		triggerCallback: _.noop,
		runCallback: _.noop,
		runExceptionHandle: _.noop,
		successCallback: _.noop,
		readyCallback: _.noop,
		nextLoopCallback: _.noop,
		consoleFn: _.noop
	};

	setup = function (options) {
		if (_.isString(options)) {
			return settings[options];
		}

		if (_.isObject(options)) {
			_.forEach(options, function (value, key) {
				this[key] = value;
			}, settings);
			return;
		}
	};
	setup.setContextFrame = function (iframeDOM) {
		trigger.setupIframe(iframeDOM);
		settings.contextFrame = iframeDOM;
	};

	function init(wrapDOM, callback) {
		var e = settings.contextFrame;
		e.style.height = '100%';
		e.style.width = '100%';

		wrapDOM.appendChild(e);
		(callback || _.noop).call(e);
	}

	function getLemoncaseFrame() {
		return settings.contextFrame;
	}

	module.exports = {
		'_': _,
		settings: settings,
		setup: setup,
		init: init,
		getLemoncaseFrame: getLemoncaseFrame
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint vars: true, sloppy: true, nomen: true */
	/*global now: false, _, instructions */

	var _ = __webpack_require__(20)['_'];

	//1_SYSTEM 2_USER -1_ERROR 0_NOTICE
	var Collector = function (dataKeys) {
		this.$$baseTime = 0;

		this.$dataKeys = dataKeys || [];
		this.$marks = [];
		this.$logs = [];
		this.$datas = {};
	};

	Collector.prototype.initialization = function () {
		this.clear();
		this.$$baseTime = _.now();

		_.forEach(this.$dataKeys, function (keyName) {
			this[keyName] = [];
		}, this.$datas);

		return this;
	};

	Collector.prototype.getLength = function (key) {
		return this['$' + key].length;
	};

	Collector.prototype.log = function (content, line) {
		this.$logs.push([content, _.now() - this.$$baseTime, line || 0]);

		return this;
	};

	Collector.prototype.data = function (key, value) {
		this.$datas[key].push(value);

		return this;
	};

	Collector.prototype.markLog = function (key, value) {
		this.$marks.push([key, value, this.getLength('logs') - 1]);

		return this;
	};

	Collector.prototype.clear = function () {
		this.$$baseTime = 0;
		this.$marks.length = 0;
		this.$logs.length = 0;
		this.$datas = {};

		return this;
	};

	Collector.prototype.export2json = function () {
		return {
			baseTime: this.$$baseTime,
			marks: this.$marks,
			logs: this.$logs,
			performance: this.$datas
		};
	};

	Collector.prototype.export2text = function () {
		return JSON.stringify(this.export2json());
	};

	module.exports = Collector;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint vars: true, sloppy: true, nomen: true */
	/**
	 * Dictionary use to input action when data type is "index".
	 *
	 * To create a dictionary which has 2 field with 3 assignments.
	 *
	 *     var dict = new Dictionary({
	 *       field: [
	 *         {name: "username", pattern: /zjm\d{6}/, comment: "comment_1"},
	 *         {name: "password", pattern: /\d{8}/, comment: "comment_2"}
	 *       ],
	 *       assignment: [
	 *         ["lichao", "lichaopass"],
	 *         ["shiweilin", "shiweilinpass"],
	 *         ["liyueyu", "liyueyupass"]
	 *       ]
	 *     });
	 *
	 * @class Dictionary
	 * @constructor
	 * @extends Entity
	 * @param {object} options
	 * @param {object} options.id
	 * @param {object} options.name
	 * @param {object} options.comment
	 * @param {object} options.createtime
	 * @param {object} options.updatetime
	 * @param {object} options.field
	 * @param {object} options.assignment
	 */
	var _ = __webpack_require__(20)['_'];

	function Dictionary(options) {
		if (!(this instanceof Dictionary)) {
			return new Dictionary(options);
		}

		this.$options = {};

		/**
		 * Cache a builder result in it.
		 *
		 * @property $$buffer
		 * @type array
		 * @private
		 * @default []
		 */
		this.$$buffer = [];
		/**
		 * Specific value list
		 *
		 * @property $assignment
		 * @type array
		 * @private
		 * @default []
		 */
		this.$assignment = [];
		/**
		 * Field configuration.
		 *
		 * @property $field
		 * @type array
		 * @private
		 * @default []
		 */
		this.$field = [];

		this.field(options.field);
		this.assignment(options.assignment);
	}

	/**
	 * The getter/setter of the property "field".
	 *
	 * @method field
	 * @param {array} [field]
	 * @return {array} The fields of this "dictionary".
	 * @example
	 *
	 *     dict.field();
	 *     dict.field(1000);
	 */
	Dictionary.prototype.field = function (field) {
		if (_.isArray(field)) {
			this.$field = field;
		}
		this.$options.field = this.$field;
		return this.$field;
	};

	/**
	 * The getter/setter of the property "assignment".
	 *
	 * @method assignment
	 * @param {array} [assignment]
	 * @return {array} The assignments of this "dictionary".
	 * @example
	 *
	 *     step.assignment();
	 *     step.assignment(1000);
	 */
	Dictionary.prototype.assignment = function (assignment) {
		if (_.isArray(assignment)) {
			this.$assignment = assignment;
		}
		this.$options.assignment = this.$assignment;
		return this.$assignment;
	};

	/**
	 * To load in buffer by assignment & fields.
	 *
	 * @method load
	 * @param {number} length The length of dictionary.
	 * @return {Dictionary} this
	 * @chainable
	 * @example
	 *
	 *     dict.load(10);
	 */
	Dictionary.prototype.load = function (length) {
		var i, len = this.$assignment.length,
			keys = this.getKeys(),
			len_of_fields = keys.length;

		var Row = function (row_array) {
			_.forEach(keys, function (field, index) {
				this[field.name] = row_array[index];
			}, this);
		};
		var RandRow = function () {
			_.forEach(keys, function (field) {
				this[field.name] = field.pattern.gen();
			}, this);
		};

		this.$$buffer = [];
		// load assignment.
		for (i = 0; i < len && i < length; i += 1) {
			this.$$buffer.push(new Row(this.$assignment[i]));
		}
		// load rand row.
		for (null; i < length; i += 1) {
			this.$$buffer.push(new RandRow());
		}

		return this;
	};

	/**
	 * Get all fields config of this "dictionary".
	 *
	 * @method getKeys
	 * @return {array} keys
	 * @example
	 *
	 *     dict.getKeys();
	 */
	Dictionary.prototype.getKeys = function () {
		var keys = [];
		_.forEach(this.$field, function (field) {
			this.push({
				name: field.name,
				pattern: new RegExp(field.pattern)
			});
		}, keys);

		return keys;
	};

	/**
	 * Get one row from $$buffer in front.
	 *
	 * @method fetch
	 * @return {object} One row in $$buffer.
	 * @example
	 *
	 *     dict.fetch();
	 */
	Dictionary.prototype.fetch = function () {
		return this.$$buffer.shift();
	};

	Dictionary.prototype.isFieldDefined = function (name) {
		var i, len = this.$field.length;

		for (i = 0; i < len; i += 1) {
			if (this.$field[i].name === name) { return true; }
		}

		return false;
	};

	module.exports = Dictionary;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint vars: true, sloppy: true, nomen: true */
	var $CP = __webpack_require__(17).$CP,
		_ = __webpack_require__(20)['_'],
		settings = __webpack_require__(20).settings,
		IF = __webpack_require__(19),
		CALL = __webpack_require__(18).CALL;

	$CP.$setIdleTask = function (taskFn) {
		this.$$idleTask = _.isFunction(taskFn) ? taskFn : _.noop;

		return this;
	};

	$CP.$setActiveTime = function (offset) {
		this.$$activeTime = _.now() + (offset || 0);

		return this;
	};

	$CP.$setTempInstruction = function (ins) {
		this.$$tempInstruction = ins ? ins.assignCase(this) : undefined;

		return this;
	};

	$CP.$setState = function (state) {
		this.$$state = state;

		return this;
	};

	$CP.$pushBlock = function (segment) {
		this.$$blockStack.push({
			counter: 0,
			segment: segment
		});

		return this;
	};

	$CP.$pushScope = function (identifer) {
		// BlockStack
		var BS = this.$$blockStack;

		this.$$scopeStack.push({
			blockIndex: BS.length,
			vars: {}
		});
		this.$pushBlock(this.$getProcess(identifer));

		return this;
	};

	$CP.$popBlock = function () {
		this.$$blockStack.pop();

		return this;
	};

	$CP.$popScope = function () {
		// Notice: To pop scope stack by this way because one scope relate to
		// one block but one block not relate to one scope necessarily. There
		// is a "blockIndex" property in scopes to show which block relate to,
		// and then we must pop all blocks (like if {...}, loop {...}) in the
		// process from "$blockStack".

		var BI = this.$$scopeStack.pop(); // (B)lock(I)nfo.
		this.$$blockStack.length = BI.blockIndex;

		return this;
	};

	$CP.$getCurrentBlock = function () {
		return _.last(this.$$blockStack);
	};

	$CP.$getCurrentScope = function () {
		return _.last(this.$$scopeStack);
	};

	$CP.$getProcess = function (identifier) {
		return this.$$executionTree.process[identifier];
	};

	$CP.$exitLoop = function () {
		this.$setActiveTime(this.$$getConfig('interval') || 3000);

		if ((this.$$currentLoop += 1) >= this.$$getConfig('times')) {
			this.$$exitCase();
			return this;
		}
		this.$setTempInstruction(IF(CALL).create('main'));
		(settings.nextLoopCallback || _.noop).call(this);

		if (this.hasDictionary()) {
			this.$loopData = this.$dictionary.fetch();
		}

		return this;
	};

	$CP.$runExp = function (expFn) {
		if (typeof expFn === 'function') {
			return expFn(this.$getCurrentScope().vars,
						 this.$objectList, this.$loopData,
						 _.countDOM, _.getInnerHTML);
		}
		return expFn;
	};

	$CP.$pushLog = function (content, line) {
		this.getLog().log(content, line);

		return this;
	};

	$CP.$markLog = function (type, msg) {
		this.getLog().markLog(type, msg);

		return this;
	};

	$CP.$pushLogData = function (assertId, delay) {
		this.getLog().data(assertId, delay);

		return this;
	};

	$CP.$clearScope = function () {
		while (this.$$scopeStack.length) {
			this.$popScope();
		}

		return this;
	};

	module.exports = $CP;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint vars: true, sloppy: true, nomen: true */
	var $CP = __webpack_require__(17).$CP,
		settings = __webpack_require__(20).settings,
		Dictionary = __webpack_require__(22);

	$CP.hasDictionary = function () {
		return !!this.$dictionary;
	};

	$CP.validateObjectList = function (objectList, keysUsed) {
	    if (!keysUsed.length) {
	        return true;//未使用原件
	    }

	    if (!objectList) {
	        return false;//使用了元件但没有引元件库
	    }

		return keysUsed.every(function (key) {
			//null or undefined => fail
			//0, NaN, '' ... => success
			return objectList[key] !== null;
		});
	};

	$CP.exportLog = function (type) {
		return this.$$log['export2' + type]();
	};

	$CP.start = function () {
		var state = this.$$state;
		if (state !== 'success' && state !== 'ready') {
			throw new Error('Can not call play!');
		}

		try {
			this.$setState('running').$$bootstrap();
			setTimeout(function () {
				this.$$core();
			}.bind(this), settings.readyTimeout);

			return this;
		} catch (error) {
			settings.bootExceptionHandle(error);
		}
	};

	$CP.forceCofig = function (config) {
		var key, eTC = this.$$executionTree.config;
		for (key in config) {
			if (config.hasOwnProperty(key)) {
				eTC[key] = config[key];
			}
		}

		return this;
	};

	$CP.suspend = function () {
		if (this.$$state !== 'running') {
			throw new Error('Can not call pause!');
		}
		this.$setState('pause').$$interrupt();

		return this;
	};

	$CP.resume = function () {
		if (this.$$state !== 'pause') {
			throw new Error('Can not call resume!');
		}
		this.$setState('running').$$core();

		return this;
	};

	$CP.stop = function () {
		var state = this.$$state;
		if (state !== 'running' && state !== 'pause') {
			throw new Error('Can not call stop!');
		}
		this.$setState('ready').$$interrupt();

		return this;
	};

	$CP.debug = function () {
		var state = this.$$state;
		if (state !== 'success' && state !== 'ready') {
			throw new Error('Can not call play!');
		}
		this.$setState('debug').$$bootstrap();

		return this;
	};

	$CP.dictionary = function (dictionary) {
		if (dictionary instanceof Dictionary) {
			this.$dictionary = dictionary;
		}

		return this.$dictionary;
	};

	$CP.getLog = function () {
		return this.$$log;
	};

	$CP.getCurrentStep = function () {
		return this.$$counter;
	};

	$CP.getCurrentLoop = function () {
		return this.$$currentLoop;
	};

	$CP.getCurrentLine = function () {
		return this.$$instructionBuffer.$getLine();
	};

	module.exports = $CP;

/***/ },
/* 25 */
/***/ function(module, exports) {

	(function () {
		var types = {
			POSITION: 0,
			CLASS: 2,
			RANGE: 3,
			CLAUSE: 6,
			REFERENCE: 7,
			INTS: '0123456789',
			WORDS: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
			WHITESPACE: ' \f\n\r\t\v\u00A0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u2028\u2029\u202f\u205f\u3000'
		};
		//
		// All of these are private and only used by randexp
		// it's assumed that they will always be called with the correct input
		//
		var CTRL = '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^ ?',
			SLSH = {
				'0': 0,
				't': 9,
				'n': 10,
				'v': 11,
				'f': 12,
				'r': 13
			}
		var util = {
			// returns random character from string
			rndChar: function (str) {
				return str[Math.floor(Math.random() * str.length)];
			},
			// returns any random character
			anyRndChar: function () {
				return String.fromCharCode(util.rndInt(0, 65535));
			},
			// finds character representations in str and convert all to
			// their respective characters
			strToChars: function (str) {
				var chars_regex = /\\(?:u([A-F0-9]{4})|x([A-F0-9]{2})|(0?[0-7]{2})|c([@A-Z\[\\\]^?])|([0tnvfr]))/g;
				str = str.replace(chars_regex, function (s, a16, b16, c8, dctrl, eslsh) {
					var code = a16 ? parseInt(a16, 16) :
						b16 ? parseInt(b16, 16) :
						c8 ? parseInt(c8, 8) :
						dctrl ? CTRL.indexOf(dctrl) :
						eslsh ? SLSH[eslsh] : undefined;
					var c;
					if (code !== undefined) {
						c = String.fromCharCode(code);
						// escape special regex characters
						c = c.replace(/[[\]{}^$.|?*+()]/g, function (n) {
							return '\\' + n;
						});
					} else {
						c = '\\' + eslsh;
					}
					return c;
				});
				return str;
			},
			// returns random number in the rane [a, b]
			rndInt: function (a, b) {
				return a + Math.floor(Math.random() * (1 + b - a));
			},
			// returns index of first occurance of b that is not preceeded by a
			findChar: function (str) {
				var a = '\\',
					b = ']',
					offset = 0;
				while (true) {
					var i = str.indexOf(b);
					if (str[i - 1] === a) {
						str = str.slice(++i);
						offset += i;
					} else {
						return offset + i;
					}
				}
			},
			// returns characters represented by range
			range: function (match, from, to) {
				var chars = types.WORDS;
				return chars.slice(chars.indexOf(from), chars.indexOf(to) + 1);
			},
			// changes ranges in class to characters
			classRange: function (str) {
				return str.replace(/(\w)-(\w)/g, util.range);
			},
			// returns an alphabetic string with both cases of the given char
			toBothCases: function (c) {
				var chars = c;
				// find out if c is lower or upper case
				chars += c['to' + (c === c.toLowerCase() ? 'Upper' : 'Lower') + 'Case']();
				return chars;
			},
			// adds characters of the other case based on ignoreCase
			inCaseClass: function (str, ignoreCase) {
				if (ignoreCase) {
					str = str.replace(/[a-zA-Z]/g, function (c) {
						return util.toBothCases(c);
					});
					return str;
				} else {
					return str;
				}
			},
			// if ignoreCase is on, change one character into a class
			// to allow for the other case to exist
			inCaseChar: function (c, ignoreCase) {
				if (ignoreCase && /[a-zA-Z]/.test(c)) {
					return {
						type: types.CLASS,
						chars: util.toBothCases(c)
					};
				} else {
					return c;
				}
			},
			// concactenates continous strings in array
			// if it contains one element, returns that one element
			// otherwise returns array
			flatten: function (arr) {
				for (var i = 0; i < arr.length - 1; i++) {
					if (typeof arr[i] === 'string') {
						var k = i + 1;
						while (true) {
							var el = arr[k];
							if (typeof el === 'string') {
								arr[i] += el;
								arr.splice(k, 1);
							} else {
								break;
							}
						}
					}
				}
				return arr.length === 1 ? arr[0] : arr;
			},
			// reduces a group to a simple form
			// if its stack only has one element, make it the stack
			// if it doesn't contain a PIPE or is not to be rememebered,
			// return just its stack
			reduce: function (group) {
				if (group.stack) {
					group.stack = util.flatten(group.stack)
				} else if (group.options) {
					for (var i = 0, l = group.options.length; i < l; i++) {
						group.options[i] = util.flatten(group.options[i]);
					}
				}

				return group.options || group.group || group.value ? group : group.stack;
			},
			// gets index + 1 of next closing paranthesis in str
			// that is not cancelled out by an opening one
			nextClose: function (str) {
				var n = 0;

				for (var i = 0, l = str.length; i < l; i++) {
					var c = str[i];

					switch (c) {
					case ')':
						if (n === 0) {
							return i + 1;
						}
						n--;
						break;

					case '(':
						n++;
						break;

						// skip escaped characters
					case '\\':
						i++;
						break;

					}
				}
			}
		};
		// predefined objects
		var
			WORD_BOUNDARY_POSITION = {
				type: types.POSITION,
				value: 'b'
			},
			NONWORD_BOUNDARY_POSITION = {
				type: types.POSITION,
				value: 'B'
			},
			BEGIN_POSITION = {
				type: types.POSITION,
				value: '^'
			},
			END_POSITION = {
				type: types.POSITION,
				value: '$'
			},
			WORDS_CLASS = {
				type: types.CLASS,
				chars: types.WORDS
			},
			ANTI_WORDS_CLASS = {
				type: types.CLASS,
				chars: types.WORDS,
				not: true
			},
			INTS_CLASS = {
				type: types.CLASS,
				chars: types.INTS
			},
			ANTI_INTS_CLASS = {
				type: types.CLASS,
				chars: types.INTS,
				not: true
			},
			WHITESPACE_CLASS = {
				type: types.CLASS,
				chars: types.WHITESPACE
			},
			ANTI_WHITESPACE_CLASS = {
				type: types.CLASS,
				chars: types.WHITESPACE,
				not: true
			},
			ANY_CHAR_CLASS = {
				type: types.CLASS,
				chars: '\n',
				not: true
			};
		// reads regex string and separates everything into tokens
		var tokenize = function (str, ignoreCase, multiline) {
			var i = 0,
				c,
				start = {
					type: types.CLAUSE,
					stack: []
				},
				// keep track of last clause and stack
				lastGroup = start,
				last = start.stack,
				groupStack = [];
			// decode a few escaped characters
			str = util.strToChars(str);
			// iterate through each character in string
			while (i < str.length) {
				c = str[i++];
				switch (c) {
					// handle escaped characters, inclues a few classes
				case '\\':
					c = str[i++]
					switch (c) {
					case 'b':
						last.push(WORD_BOUNDARY_POSITION);
						break;
					case 'B':
						last.push(NONWORD_BOUNDARY_POSITION);
						break;
					case 'w':
						last.push(WORDS_CLASS);
						break;
					case 'W':
						last.push(ANTI_WORDS_CLASS);
						break;
					case 'd':
						last.push(INTS_CLASS);
						break;
					case 'D':
						last.push(ANTI_INTS_CLASS);
						break;
					case 's':
						last.push(WHITESPACE_CLASS);
						break;
					case 'S':
						last.push(ANTI_WHITESPACE_CLASS);
						break;
					default:
						if (/\d/.test(c)) {
							last.push({
								type: types.REFERENCE,
								value: parseInt(c)
							});
							// escaped character
						} else {
							last.push(c);
						}
					}
					break;
					// positionals
				case '^':
					last.push(BEGIN_POSITION);
					break;
				case '$':
					last.push(END_POSITION);
					break;
					// handle classes
				case '[':
					c = str[i];
					if (c === '\\' && str.slice(i + 1).indexOf('b]') === 0) {
						i += 3;
						last.push('\u0008');
					} else {
						var not;
						if (c === '^') {
							not = true;
							i++;
						} else {
							not = false;
						}
						// get all the characters in class
						var strPart = str.slice(i),
							l = util.findChar(strPart),
							chars = strPart.substring(0, l);
						// increase index by length of class
						i += l + 1;
						last.push({
							type: types.CLASS,
							chars: util.inCaseClass(util.classRange(chars), ignoreCase),
							not: not
						});
					}
					break;
					// class of any character except \n
				case '.':
					last.push(ANY_CHAR_CLASS);
					break;
					// push group onto stack
				case '(':
					c = str[i];
					var remember;
					if (c === '?') {
						c = str[i + 1];
						i += 2;
						// match only if not followed by this
						// skip
						if (c === '!') {
							i += util.nextClose(str.slice(i));
							break;
						}
						remember = false;
					} else {
						remember = true;
					}
					// create group
					var group = {
						type: types.CLAUSE,
						group: remember,
						stack: []
					};
					// insert subgroup into current group stack
					last.push(group);
					// remember the current group for when the group closes
					groupStack.push(lastGroup);
					// make this new group the current group
					lastGroup = group;
					last = group.stack;
					break;
					// pop group out of stack
				case ')':
					lastGroup = groupStack.pop();
					// check if this group has a PIPE
					// to get back the correct last stack
					last = lastGroup.options ? lastGroup.options[lastGroup.options.length - 1] : lastGroup.stack;
					// make sure the last group in the last stack is reduced
					var lasti = last.length - 1;
					last[lasti] = util.reduce(last[lasti]);
					break;
					// use pipe character to give more choices
				case '|':
					// create array where options are if this is the first PIPE
					// in this clause
					if (!lastGroup.options) {
						lastGroup.options = [lastGroup.stack];
						delete lastGroup.stack;
					}
					// create a new stack and add to options for rest of clause
					var stack = [];
					lastGroup.options.push(stack);
					last = stack;
					break;
					// repetition
					// for every repetition, remove last element from last stack
					// then insert back a RANGE object
					// this design is chosen because there could be more than
					// one repetition symbols in a regex i.e. a?+{2,3}
				case '{':
					var rs = /^(\d+)(,(\d+)?)?\}/.exec(str.slice(i)),
						min = parseInt(rs[1]),
						max = rs[2] ? rs[3] ? parseInt(rs[3]) : Infinity : min;
					i += rs[0].length;
					var popped = last.pop();
					// if min matches max, pre-generate the output
					if (min === max) {
						for (var k = 0; k < min; k++) {
							last.push(popped);
						}
					} else {
						last.push({
							type: types.RANGE,
							min: min,
							max: max,
							value: popped
						});
					}
					break;
				case '?':
					var popped = last.pop();
					last.push({
						type: types.RANGE,
						min: 0,
						max: 1,
						value: popped
					});
					break;
				case '+':
					var popped = last.pop();
					last.push({
						type: types.RANGE,
						min: 1,
						max: Infinity,
						value: popped
					});
					break;
				case '*':
					var popped = last.pop();
					last.push({
						type: types.RANGE,
						min: 0,
						max: Infinity,
						value: popped
					});
					break;
					// default is a character that is not \[](){}?+*^$
				default:
					// if ignoreCase is on, turn alpha character into a class
					// with both lower and upper case versions of the character
					last.push(util.inCaseChar(c, ignoreCase));
				}
			}
			return util.reduce(start);
		};
		// generate random string modeled after given tokens
		var gen = function (obj, max, anyRndChar, groups) {
			// check if obj is String
			if (typeof obj === 'string') {
				return obj;
			}
			// check if obj is Array
			if (obj.length) {
				var str = '';
				for (var i = 0, l = obj.length; i < l; i++) {
					str += gen(obj[i], max, anyRndChar, groups);
				}
				return str;
			}
			// otherwise obj must be an Object
			switch (obj.type) {
			case types.POSITION:
				// do nothing for now
				return '';
			case types.CLASS:
				// if this class is an except class i.e. [^abc]
				// generate a random character until one that isnt in this class
				// is found
				if (obj.not) {
					while (true) {
						var c = anyRndChar();
						if (obj.chars.indexOf(c) === -1) {
							return c;
						}
					}
					// otherwise, generate a random character from the class
				} else {
					return util.rndChar(obj.chars);
				}
			case types.RANGE:
				var n = util.rndInt(obj.min,
						obj.max === Infinity ? obj.min + max : obj.max),
					str = '';
				for (var i = 0; i < n; i++) {
					str += gen(obj.value, max, anyRndChar, groups);
				}
				return str;
			case types.CLAUSE:
				// check if this clause is between a pipe
				if (obj.options) {
					var n = util.rndInt(0, obj.options.length - 1);
					return gen(obj.options[n], max, anyRndChar, groups);
					// otherwise this must be a group
				} else {
					var value = gen(obj.stack, max, anyRndChar, groups);
					groups.push(value);
					return value;
				}
			case types.REFERENCE:
				return groups[obj.value - 1];
			}
		};
		// add randexp to global RegExp prototype
		// this enables sugary //.gen syntax
		RegExp.prototype.gen = function () {
			if (this._randexp === undefined) {
				this._randexp = tokenize(this.source, this.ignoreCase, this.multiline);
				this._max = this._max || 100;
				this._anyRndChar = this._anyRndChar || util.anyRndChar;
			}
			return gen(this._randexp, this._max, this._anyRndChar, []);
		};
		
		if (typeof window === 'undefined') module.exports = gen;
	}());


/***/ }
/******/ ]);