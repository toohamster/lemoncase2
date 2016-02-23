var tt = require('./tokentype.js').types;

module.exports = function (Parser) {
	var pp = Parser.prototype;

	// ### Expression parsing

	// These nest, from the most general expression type at the top to
	// 'atomic', nondivisible expression types at the bottom. Most of
	// the functions will simply let the function(s) below them parse,
	// and, *if* the syntactic construct they handle is present, wrap
	// the AST node that the inner parser gave them in another node.

	// Parse a full expression. The optional arguments are used to
	// forbid the `in` operator (in for loops initalization expressions)
	// and provide reference for storing '=' operator inside shorthand
	// property assignment in contexts where both object expression
	// and object pattern might appear (so it's possible to raise
	// delayed syntax error at correct position).

	pp.parseExpression = function () {
		var expr = this.parseMaybeAssign();
		if (this.type === tt.comma) {
			var node = {
				type: 'SequenceExpr'
			};
			node.expressions = [expr];

			while (this.eat(tt.comma)) {
				var newExpr = this.parseMaybeAssign();
				node.expressions.push(newExpr);
			}

			return node;
		}

		return expr;
	};

	// Parse an assignment expression. This includes applications of
	// operators like `+=`.

	pp.parseMaybeAssign = function () {
		var left = this.parseMaybeConditional();

		if (this.type.isAssign) {
			var node = {
				type: 'AssignmentExpr',
				left: left,
				operator: this.value
			};

			this.next();

			node.right = this.parseMaybeAssign();

			return node;
		}

		return left;
	};

	// Parse a ternary conditional (`?:`) operator.

	pp.parseMaybeConditional = function () {


		// maybe we will need '?' in the future?

		return this.parseExprOps();
	};

	// Start the precedence parser.

	pp.parseExprOps = function () {
		var startPos = this.start;
		var expr = this.parseMaybeUnary(false);

		return this.parseExprOp(expr, startPos, -1);
	};

	// Parse binary operators with the operator precedence parsing
	// algorithm. `left` is the left-hand side of the operator.
	// `minPrec` provides context that allows the function to stop and
	// defer further parser to one of its callers when it encounters an
	// operator that has a lower precedence than the set it is parsing.

	pp.parseExprOp = function (left, leftStartPos, minPrec) {
		var prec = this.type.binop;

		if (prec != null) {
			if (prec > minPrec) {
				var logical = this.type === tt.logicalOR || this.type === tt.logicalAND;
				var op = this.value;
				this.next();
				var startPos = this.start;
				var right = this.parseExprOp(this.parseMaybeUnary(false), startPos, prec);
				var node = this.buildBinary(leftStartPos, left, right, op, logical);

				return this.parseExprOp(node, leftStartPos, minPrec);
			}
		}

		return left;
	};

	pp.buildBinary = function (startPos, left, right, op, logical) {
		var node = {
			left: left,
			operator: op,
			right: right
		};

		node.type = logical ? 'LogicalExpr' : 'BinaryExpr';

		return node;
	};

	pp.parseMaybeUnary = function (sawUnary) {
		var startPos = this.start, expr;
		if (this.type.prefix) {
			var node = {}, update = this.type === tt.incDec;
			node.operator = this.value;
			node.prefix = true;

			this.next();

			node.argument = this.parseMaybeUnary(false);

			if (update) {

			} else {
				sawUnary = true;
			}

			node.type = update ? 'UpdateExpr' : 'UnaryExpr';

			expr = node;
		} else {
			expr = this.parseExprSubscripts();

			while (this.type.postfix) {
				var out = {};
				out.operator = this.value;
				out.prefix = false;
				out.argument = expr;

				this.next();

				out.type = 'UpdateExpr';
				expr = out;
			}
		}

		return expr;
	};

	pp.parseExprSubscripts = function () {
		var startPos = this.start;
		var expr = this.parseExprAtom();

		return this.parseSubscripts(expr, startPos);
	};

	pp.parseSubscripts = function (base, startPos) {
		for (;;) {
			if (this.eat(tt.parenL)) {
				var node = {
					type: 'CallExpr'
				};

				throw 'todo';
			} else {
				return base;
			}
		}
	};

	// Parse an atomic expression — either a single token that is an
	// expression, an expression started by a keyword like `function` or
	// `new`, or an expression wrapped in punctuation like `()`, `[]`,
	// or `{}`.

	pp.parseExprAtom = function () {
		var node;

		switch (this.type) {
			case tt.name:
				return this.parseIndent(this.type !== tt.name);

			case tt.regexp:
				var value = this.value;
				node = this.parseLiteral(value.value);
				node.regexp = { pattern: value.pattern, flags: value.flags };

				return node;

			case tt.num: case tt.string:
				return this.parseLiteral(this.value);

			case tt.parenL:
				return this.parseParenExpression();

			case tt.tagAtL: case tt.tagNumL:
				return this.parseTagExpression();

			default:
				this.unexpected();
		}
	};

	pp.parseLiteral = function (value) {
		var node = {
			type: 'literal',
			value: value,
			raw: this.input.slice(this.start, this.end)
		};

		this.next();

		return node;
	};

	pp.parseParenExpression = function () {
		this.expect(tt.parenL);
		var val = this.parseExpression();
		this.expect(tt.parenR);

		return {
			type: 'ParenthesizedExpression',
			expression: val
		};
	};

	pp.parseTagExpression = function () {
		var node = {
			type: this.type.label
		};

		this.next();
		node.val = this.parseExpression();
		this.expect(tt.tagR);

		return node;
	};

	pp.parseIndent = function () {
		var name;

		if (this.type === tt.name) {
			name = this.value;
		} else {
			this.unexpected();
		}

		this.next();

		return name;
	}
};