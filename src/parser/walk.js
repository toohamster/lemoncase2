// walk a javascript style tree and transform it into a function

var visitors = {
	varDecl: function (node, c) {
		var out = '';
		var first = true;

		node.declarations.forEach(function (decl) {
			if (decl.init) {
				if (!first) out += ',';

				out += '$.' + decl.id + ' = ' + c(decl.init);

				first = false;
			}
		});

		return '(' + out + ')';
	},
	SequenceExpr: function (node, c) {
		var out = '';
		var first = true;

		node.expressions.forEach(function (expr) {
			if (!first) out += ',';

			out += c(expr);

			first = false;
		});

		return '(' + out + ')';
	},

	// end point node
	literal: function (node) {
		return node.raw;
	},
	regexp: function (node) {
		// regex.gen
		if (node.regexp.isGenerate) {
			var val = node.regexp;

			return '(/' + val.pattern + '/' + val.flags + ').gen()';
		}
		// regular regular expression is fine...
		return '(' + node.raw + ')';
	},
	Identifier: function (node) {
		return '$.' + node.name;
	},

	// binary operator
	LogicalExpr: function (node, c) {
		return c(node.left) + node.operator + c(node.right);
	},
	BinaryExpr: function (node, c) {
		return c(node.left) + node.operator + c(node.right);
	},
	MatchExpr: function (node, c) {
		var out = '';

		if (node.operator === '~~') out += '!';

		// return out + '!(' + c(node.left) + ').match(' + c(node.right) + ')';
		return out + '!m(' + c(node.left) + ',' + c(node.right) + ')';
	},

	// unary
	UpdateExpr: function (node) {
		var inside = '$.' + node.argument;

		return node.prefix ? node.operator + inside : inside + node.operator;
	},
	UnaryExpr: function (node, c) {
		return node.operator + '(' + c(node.argument) + ')';
	},

	// assign
	AssignmentExpr: function (node, c) {
		return c(node.left) + node.operator + c(node.right);
	},

	// ()
	ParenthesizedExpr: function (node, c) {
		return '(' + c(node.expression) + ')';
	},

	// <@
	TextExpr: function (node, c) {
		var inside = 'String(' + c(node.val) + ')';

		return 't(' + inside + ')';
	},
	CountExpr: function (node, c) {
		var inside = 'String(' + c(node.val) + ')';

		return 'c(' + inside + ')';
	},
	VisibilityExpr: function (node, c) {
		var inside = 'String(' + c(node.val) + ')';

		return 'v(' + inside + ')';
	}
};

module.exports = function genExpr(node) {
	var string = (function c(node) {
		var type = node.type;

		return visitors[type](node, c);
	})(node);

	return new Function('$,o,d,c,t,v,m', 'return ' + string + ';');
};
