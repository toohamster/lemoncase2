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
		if (!this.eat(tt.semi)) this.unexpected();
	};

	pp.expect = function (type) {
		this.eat(type) || this.unexpected();
	};

	pp.unexpected = function (pos) {
		this.raise(pos != null ? pos : this.start, 'Unexpected token');
	};
};