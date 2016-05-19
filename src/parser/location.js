var locutil = require('./locutil');
var getLineInfo = locutil.getLineInfo;
var empowerErrMsg = locutil.empowerErrMsg;

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
		var left = this.options.left, right = this.options.right;
		if (left || right) {
			msg = left + msg + right;
		} else {
			msg = empowerErrMsg(this.input, loc, msg);
		}
		var err = new SyntaxError(msg);
		err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
		throw err;
	};
};
