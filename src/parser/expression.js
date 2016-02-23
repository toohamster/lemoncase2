var tt = require('./tokentype.js').types;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	pp.parseMaybeAssign = function () {
		var startPos = this.start;
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