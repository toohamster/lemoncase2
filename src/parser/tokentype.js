// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).

//no startsExpr or isLoop

var TokenType = function (label, conf) {
	if (conf === undefined) { conf = {} }

	this.label = label;
	this.keyword = conf.keyword;
	this.beforeExpr = !!conf.beforeExpr;
	this.isAssign = !!conf.isAssign;
	this.prefix = !!conf.prefix;
	this.postfix = !!conf.postfix;
	this.binop = conf.binop || null;
};

function binop (name, prec) {
	return new TokenType(name, { beforeExpr: true, binop: prec });
}

var beforeExpr = { beforeExpr: true };

var types = {
	num: new TokenType('num'),
	regexp: new TokenType('regexp'),
	string: new TokenType('string'),
	name: new TokenType('name'),
	eof: new TokenType('eof'),

	// special to lemoncase
	objectAt: new TokenType('object@'),
	dict: new TokenType('dictionary index'),

	//punctuation token types
	bracketL: new TokenType('[', beforeExpr),
	bracketR: new TokenType(']'),
	braceL: new TokenType('{', beforeExpr),
	braceR: new TokenType('}'),
	parenL: new TokenType('(', beforeExpr),
	parenR: new TokenType(')'),
	comma: new TokenType(',', beforeExpr),
	semi: new TokenType(';', beforeExpr),
	colon: new TokenType(':', beforeExpr),
	tagNumL: new TokenType('<#', beforeExpr),
	tagAtL: new TokenType('<@', beforeExpr),
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

	eq: new TokenType('=', { beforeExpr: true, isAssign: true }),
	assign: new TokenType('_=', { beforeExpr: true, isAssign: true }),
	incDec: new TokenType('++/--', { prefix: true, postfix: true }),
	prefix: new TokenType("prefix", {beforeExpr: true, prefix: true}),
	logicalOR: binop("||", 1),
	logicalAND: binop("&&", 2),
	equality: binop("==/!=", 6),
	relational: binop("</>", 7),
	plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true}),
	modulo: binop("%", 10),
	star: binop("*", 10),
	slash: binop("/", 10),
	match: binop('~=', 0)
};

var keywords = {};

function kw(name, options) {
	options = options || {};
	options.keyword = name;
	keywords[name] = types["_" + name] = new TokenType(name, options);
}

kw('in');
kw('by');
kw('click', beforeExpr);
kw('input', beforeExpr);
kw('rclick', beforeExpr);
kw('dblclick', beforeExpr);
kw('movein', beforeExpr);
kw('moveout', beforeExpr);
kw('scroll', beforeExpr);
kw('select', beforeExpr);
kw('CLOCK');
kw('TIMES');
kw('INTERVAL');
kw('wait', beforeExpr);
kw('assert', beforeExpr);
kw('log', beforeExpr);
kw('var');
kw('#set');
kw('process');
kw('return', beforeExpr);

module.exports = {
	TokenType: TokenType,
	types: types,
	keywordTypes: keywords
};