module.exports = {
	entry: [
		'./src/index.js'
	],
	module: {
		loaders: []
	},
	output: {
		filename: 'lemoncase.js',
		path: __dirname + '/dist',
		library: 'LC',
		libraryTarget: 'umd'
	}
};