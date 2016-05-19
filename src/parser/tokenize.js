var identifier = require('./identifier');
var isIdentifierStart = identifier.isIdentifierStart;
var isIdentifierChar = identifier.isIdentifierChar;

var tt = require('./tokentype').types;
var keywordTypes = require('./tokentype').keywordTypes;

var whitespace = require('./whitespace');
var isNewLine = whitespace.isNewLine;
var lineBreak = whitespace.lineBreak;

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
		while (this.pos < this.input.length &&
			ch !== 10 && ch !== 13 && 
			ch !== 8232 && ch !== 8233) {
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

		return this.finishToken(tt.bracketL);
	};

	pp.readToken_brace = function () {
		var start = this.pos++;
		var next = this.fullCharCodeAtPos();

		return this.finishToken(tt.braceL);
	};

	pp.readToken_slash = function () {
		var next = this.input.charCodeAt(this.pos+1);
		if (this.exprAllowed || this.genAllowed) {
			++this.pos;

			return this.readRegexp(this.genAllowed);
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
			if (next === 33) return this.finishOp(tt.tagFacL, 2); // '!'
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
			default:
				this.raise(this.pos, 'Unexpected character "' + this.input[this.pos] + '"');	
		}
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

		this.genAllowed = type.beforeGen;
		this.exprAllowed = type.beforeExpr;
	};

	pp.readRegexp = function (isGen) {
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
				} else if (ch === '/' && !inClass) {
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
			isGenerate: isGen
		};

		return this.finishToken(tt.regexp, value);
	};

	pp.readInt = function (radix, len) {
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
			if (next === 43 || next === 45) ++this.pos; // +/-
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
			case 13: if (this.fullCharCodeAtPos() === 10) ++this.pos; // '\r\n'
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
			} else {
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
		while (this.pos < this.input.length &&
			ch !== 10 && ch !== 13 && 
			ch !== 8232 && ch !== 8233) {
			++this.pos;
			ch = this.input.charCodeAt(this.pos);
		}

		return this.input.slice(start, this.pos).trim();
	};
};
