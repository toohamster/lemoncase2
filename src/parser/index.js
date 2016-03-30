var Parser = require('./state');

module.exports = {
	parse: function (input, options) {
		return new Parser(options, input).parse();
	},
	tokenizer: function (input, options) {
		return new Parser(options, input);
	}
};
