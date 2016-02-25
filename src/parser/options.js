var has = require('./util.js').has;

var defaultOptions = {
	insertReturn: true,
	onComment: function (){},
	plugins: {}
};

function getOptions (options) {
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