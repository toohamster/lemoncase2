var lineBreakG = require('./whitespace.js').lineBreakG;

var Position = function (line, col) {
	this.line = line;
	this.column = col;
};

Position.prototype.offset = function (n) {
	return new Position(this.line, this.column + n);
};

function getLineInfo(input, offset) {
	for (var line = 1, cur = 0;;) {
		lineBreakG.lastIndex = cur;
		var match = lineBreakG.exec(input);
		if (match && match.index < offset) {
			++line;
			cur = match.index + match[0].length;
		} else {
			return new Position(line, offset - cur);
		}
	}
}

module.exports = {
	getLineInfo: getLineInfo
};