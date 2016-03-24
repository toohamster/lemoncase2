var lineBreakG = require('./whitespace.js').lineBreakG;

var Position = function (line, col) {
	this.line = line;
	this.column = col;
};

Position.prototype.offset = function (n) {
	return new Position(this.line, this.column + n);
};

// determine the position of error
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

// provide better error message

function empowerErrMsg(input, loc, msg) {
	var errLine = input.split(lineBreakG)[loc.line - 1];
	var strBeforeErr = errLine.substr(0, loc.column);
	var width = widthOf(strBeforeErr);
	
	var arrow = genArrow(width);
	var positionedMsg = positionMsg(msg, width);
	
	return '\n' + errLine + '\n' + arrow + '\n' + positionedMsg;
}

function genArrow(width) {
	var i = -1, j = -1, out = '';

	while (++i < width) {
		out += ' ';
	}

	out += '↑\n';

	while (++j < width) {
		out += ' ';
	}

	out += '↑';

	return out;
}

function positionMsg(msg, width) {
	// very long message, no need to reposition
	if (msg.length / 2 > width) {
		return msg;
	}

	var i = -1, emptyWidth = width - Math.floor(msg.length / 2), newMsg = '';
	
	while (++i < emptyWidth) {
		newMsg += ' ';
	}
	
	newMsg += msg;
	
	return newMsg;
}

// calculate width of string
function widthOf(str) {
	var code,
		width = 0,
		i = -1, len = str.length;

	while (++i < len) {
		code = str.charCodeAt(i);

		switch (code) {
			case 9: // '\t'
				width += 4;
				break;
			default:
				width += 1;
				break;
		}
	}

	return width;
}

module.exports = {
	getLineInfo: getLineInfo,
	empowerErrMsg: empowerErrMsg
};
