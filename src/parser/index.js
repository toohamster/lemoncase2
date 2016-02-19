var Parser = require('./parser.js');

module.exports = {
	parse: function (input, options) {
		return new Parser(options, input).parse();
	},
	tokenizer: function (input, options) {
		return new Parser(options, input);
	}
};