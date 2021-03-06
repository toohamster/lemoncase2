var has = require('../util').has;

var defaultOptions = {
	insertReturn: true,
	onComment: function () {},
	left: '',
	right: '',
	plugins: {}
};

function getOptions(options) {
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
