// walk a javascript style tree and transform it into a function

var visitors = {
	varDecl: function (node, c) {
		var out = '', first = true;
		
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
		var out = '', first = true;
		
		node.expressions.forEach(function (expr) {
			if (!first) out += ',';
			
			out += c(expr);
			
			first = false;
		});
		
		return '(' + out + ')';
	},
	
	// end point node
	literal: function (node, c) {
		return node.raw;
	},
	regexp: function (node, c) {
		// regex.gen
		if (node.regexp.gen) {
			var val = node.regexp;
			
			return '(/' + val.pattern + '/' + val.flags + ').gen()';
		}
		// regular regular expression is fine...
		return '(' + node.raw + ')';
	},
	dictionaryIndex: function (node, c) {
		return 'd.' + node.value;
	},
	objectStore: function (node, c) {
		return 'o.' + node.value;
	},
	Identifier: function (node, c) {
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
		
		return out + '!(' + c(node.left) + ').match(' + c(node.right) + ').length';
	},
	
	// unary
	UpdateExpr: function (node, c) {
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
	
	TextExpr: function (node, c) {
		var inside = 'String(' + c(node.val) + ')';
		
		return 't(' + inside + ')';
	},
	CountExpr: function (node, c) {
		var inside = 'String(' + c(node.val) + ')';
		
		return 'c(' + inside + ')';
	}
};

module.exports = function genExpr (node) {
	var string = (function c(node){
		var type = node.type;
		
		return visitors[type](node, c);
	})(node);
	
	return new Function('$,o,d,c,t', 'return ' + string + ';');
};
