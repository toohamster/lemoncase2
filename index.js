var LC = require('./src/index.js');

require('angular').module('lemoncase', []).provider('LC', function () {
	this.setup = LC.setup;

	this.$get = [function () {
		return LC;
	}];
});

module.exports = LC;