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
		this.raise(this.lastTokEnd, 'Expect a ' + type.label + ' after');
	};
};