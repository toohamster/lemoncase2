var Parser = require('./state');

module.exports = {
	parse: function (input, options) {
		return new Parser(options, input).parse();
	},
	tokenizer: function (input, options) {
		return new Parser(options, input);
	},
	parseFragment: function (input, options) {
		var p = new Parser(options, input);
		p.nextToken();
		
		return p.parseStatement();
	}
};
