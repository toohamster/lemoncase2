module.exports = {
	entry: [
		'./src/index.js'
	],
	module: {
		loaders: []
	},
	output: {
		filename: 'lemoncase.min.js',
		path: __dirname + '/dist'
	}
};