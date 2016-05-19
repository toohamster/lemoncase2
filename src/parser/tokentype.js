// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeGen` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).

var TokenType = function (label, conf) {
	if (conf === undefined) conf = {};

	this.label = label;
	this.keyword = conf.keyword;
	this.beforeGen = Boolean(conf.beforeGen);
	this.beforeExpr = Boolean(conf.beforeExpr);
	this.isAssign = Boolean(conf.isAssign);
	this.prefix = Boolean(conf.prefix);
	this.postfix = Boolean(conf.postfix);
	this.binop = conf.binop || null;
	this.macro = Boolean(conf.macro);
};

function binop(name, prec) {
	return new TokenType(name, {beforeGen: true, binop: prec});
}

var beforeGen = {beforeGen: true};
var macro = {macro: true};

var types = {
	num: new TokenType('num'),
	regexp: new TokenType('regexp'),
	string: new TokenType('string'),
	name: new TokenType('name'),
	eof: new TokenType('eof'),

	//punctuation token types
	bracketL: new TokenType('[', beforeGen),
	bracketR: new TokenType(']'),
	braceL: new TokenType('{', beforeGen),
	braceR: new TokenType('}'),
	parenL: new TokenType('(', beforeGen),
	parenR: new TokenType(')'),
	comma: new TokenType(',', beforeGen),
	semi: new TokenType(';', beforeGen),
	colon: new TokenType(':', beforeGen),
	tagNumL: new TokenType('CountExpr', beforeGen), // <#
	tagAtL: new TokenType('TextExpr', beforeGen), // <@
	tagFacL: new TokenType('VisibilityExpr', beforeGen), // <!
	tagR: new TokenType('/>'),

	// Operators. These carry several kinds of properties to help the
	// parser use them properly (the presence of these properties is
	// what categorizes them as operators).
	//
	// `binop`, when present, specifies that this operator is a binary
	// operator, and will refer to its precedence.
	//
	// `prefix` and `postfix` mark the operator as a prefix or postfix
	// unary operator.
	//
	// `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
	// binary operators with a very low precedence, that should result
	// in AssignmentExpression nodes.

	eq: new TokenType('=', {beforeGen: true, isAssign: true}),
	assign: new TokenType('_=', {beforeGen: true, isAssign: true}),
	incDec: new TokenType('++/--', {prefix: true, postfix: true}),
	prefix: new TokenType('prefix', {beforeGen: true, prefix: true}),
	logicalOR: binop('||', 1),
	logicalAND: binop('&&', 2),
	equality: binop('==/!=', 6),
	relational: binop('</>', 7),
	plusMin: new TokenType('+/-', {beforeGen: true, binop: 9, prefix: true}),
	modulo: binop('%', 10),
	star: binop('*', 10),
	slash: binop('/', 10),
	match: new TokenType('~~', {beforeExpr: true, binop:6})
};

var keywords = {};

function kw(name, options) {
	options = options || {};
	options.keyword = name;
	keywords[name] = types["_" + name] = new TokenType(name, options);
}

kw('in');
kw('by', beforeGen);
kw('click', beforeGen);
kw('input', beforeGen);
kw('rclick', beforeGen);
kw('dblclick', beforeGen);
kw('movein', beforeGen);
kw('moveout', beforeGen);
kw('scroll', beforeGen);
kw('select', beforeGen);
kw('#CLOCK', macro);
kw('#TIMES', macro);
kw('#INTERVAL', macro);
kw('#SCREEN', macro);
kw('wait', beforeGen);
kw('assert', beforeGen);
kw('log', beforeGen);
kw('console', beforeGen);
kw('var');
kw('process');
kw('return', beforeGen);
kw('jumpto');
kw('refresh');

module.exports = {
	TokenType: TokenType,
	types: types,
	keywordTypes: keywords
};
