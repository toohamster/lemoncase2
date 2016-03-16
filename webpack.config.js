module.exports = {
	entry: [
		'./src/index.js'
	],
	module: {
		loaders: []
	},
	output: {
		filename: 'lemoncase.js',
		publicPath: "debug/",
		path: __dirname + '/dist'
	}
};