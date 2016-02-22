var getLineInfo = require('./locutil.js').getLineInfo;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

module.exports = function (Parser) {
	var pp = Parser.prototype;

	pp.raise = function (pos, msg) {
		var loc = getLineInfo(this.input, pos);
		msg += ' (' + loc.line + ':' + loc.column + ')';
		var err = new SyntaxError(msg);
		err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
		throw err;
	}
};