var isIdentifierStart = require('./identifier.js').isIdentifierStart;
var isIdentifierChar = require('./identifier.js').isIdentifierChar;

var tt = require('./tokentype.js').types;
var keywordTypes = require('./tokentype.js').keywordTypes;

module.exports = function (Parser) {
	var pp = Parser.prototype;

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
				case 10: case 8232: case 8233:
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

	pp.getTokenFromCode = function (code) {

	};

	// Called at the end of every token. Sets `end`, `val`, and
	// maintains `context` and `exprAllowed`, and skips the space after
	// the token, so that the next one's `start` will point at the
	// right position.

	pp.finishToken = function (type, val) {
		this.end = this.pos;
		var prevType = this.type;
		this.type = type;
		this.value = val;

		this.exprAllowed = prevType.beforeExpr;
	};

	// Read an identifier or keyword token
	pp.readWord = function () {
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

		var type;
		if (this.keywords.test(word)) {
			type = keywordTypes[word];
		} else {
			if (word.charCodeAt(0) === 35) {
				this.raise(chunkStart, '# is only valid for #set');
			}

			type = tt.name;
		}

		return this.finishToken(type, word);
	}
};