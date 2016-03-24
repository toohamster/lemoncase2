// the keywords
var reserve = ["in", "by"];
var actions = ["click", "input", "rclick", "dblclick",
	"movein", "moveout", "scroll", "select", 'jumpto', 'refresh'];
var macros = ['#CLOCK', '#TIMES', '#INTERVAL', '#SCREEN'];

var keywords = ['wait', 'assert', 'log', 'console', 'var', 'process',
'return'].concat(reserve).concat(actions).concat(macros);

var keywordRegexp = new RegExp('^(' + keywords.join('|') + ')$');

function isIdentifierStart(code) {
	if (code < 65) return code === 36;//$
	if (code < 91) return true;//A-Z
	if (code < 97) return code === 95;//_
	return code < 123;//a-z
}

function isIdentifierChar(code) {
	if (code < 48) return code === 36;//$
	if (code < 58) return true;//0-9
	if (code < 65) return false;
	if (code < 91) return true;//A-Z
	if (code < 97) return code === 95;//_
	return code < 123;//a-z
}

module.exports = {
	keywordRegexp: keywordRegexp,
	isIdentifierStart: isIdentifierStart,
	isIdentifierChar: isIdentifierChar
};
