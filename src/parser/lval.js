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
	};
};
