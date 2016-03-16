/*jslint vars: true, sloppy: true, nomen: true */
/*global require, console, trigger, module */
var IF = function InstructionFactory(TYPE, opts) {
	if (!opts) {
		var IF = instructionFactories[TYPE];
		if (!IF) {
			throw new Error('TYPE:' + TYPE + ' instruction is not existed.');
		}
		return IF;
	}

	if (instructionFactories[TYPE]) {
		throw new Error('The instruction factory: TYPE=' + TYPE + ' is existed.');
	}

	function Instruction(opts, $case) {
		this.$case = $case;
		this.$body = opts.BODY;
		this.$line = opts.LINE;
	}
	Instruction.prototype.execute = opts.operation;
	Instruction.prototype.line = function () {
		return this.$line;
	};
	Instruction.prototype.body = function (key) {
		if (key) {
			return this.$body[key];
		}
		return this.$body;
	};
	Instruction.prototype.assignCase = function ($case) {
		this.$case = $case;

		return this;
	};
	Instruction.create = function () {
		return new Instruction({
			BODY: opts.bodyFactory.apply(null, arguments)
		});
	};
	Instruction.$new = function (opts, $case) {
		return new Instruction(opts, $case);
	};

	instructionFactories[TYPE] = Instruction;

	return Instruction;
}, instructionFactories = [];

module.exports = IF;
