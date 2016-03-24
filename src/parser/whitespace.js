// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;

module.exports = {
	lineBreak: lineBreak,
	lineBreakG: new RegExp(lineBreak.source, 'g'),
	isNewLine: function isNewLine(code) {
		return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
	}
};
