/*jslint sloppy: true, nomen: true */
/*global require, console */
var IF = require('./class/instruction');
var global = require('./global');
var settings = global.settings;
var getDocument = global.getDocument;
var _ = require('./util');
var instructionType = require('./instructionType');
	
var CALL = instructionType.CALL,
	RETURN = instructionType.RETURN,
	EXIT = instructionType.EXIT,

	EXPRESSION = instructionType.EXPRESSION,
	WAIT = instructionType.WAIT,
	TRIGGER = instructionType.TRIGGER,
	ASSERT = instructionType.ASSERT,
	JUMPTO = instructionType.JUMPTO,
	REFRESH = instructionType.REFRESH,

	LOG = instructionType.LOG,
	CONSOLE = instructionType.CONSOLE,
	
	PROCESS = instructionType.PROCESS,

	PASSED = 1,
	FAILURE = 0,
	
	trigger = require('oc-trigger');

IF(CALL, {
	operation: function Call() {
		var identifier = this.body('identifier');

		this.$case
			.$pushScope(identifier)
			.$pushLog([CALL, identifier], this.line());
	},
	bodyFactory: function (name) {
		return {
			identifier: name
		};
	}
});
IF(RETURN, {
	operation: function Return() {
		this.$case
			.$pushLog([RETURN])
			.$popScope();
	},
	bodyFactory: function () {
		return {};
	}
});
IF(EXIT, {
	operation: function Exit() {
		var flag = this.body('isSuccess') ? PASSED : FAILURE,
			CASE = this.$case;

		this.body('preFn')();

		if (!flag) {
			settings.runExceptionHandle(this.$case);
		}

		CASE.$pushLog([EXIT, flag], this.line())
			.$markLog(flag, CASE.getCurrentLoop())
			.$clearScope()
			.$exitLoop();
	},
	bodyFactory: function (isSuccess, preFn) {
		return {
			isSuccess: isSuccess,
			preFn: preFn || _.noop
		};
	}
});

IF(EXPRESSION, {
	operation: function Expression() {
		this.$case.$runExp(this.body('exp'));
	},
	bodyFactory: function (expFn) {
		return {
			exp: expFn
		};
	}
});
IF(WAIT, {
	operation: function Wait() {
		var delay = this.$case.$runExp(this.body('delay'));

		this.$case
			.$setActiveTime(delay)
			.$pushLog([WAIT, delay], this.line());
	},
	bodyFactory: function (delay) {
		return {
			delay: delay
		};
	}
});
IF(TRIGGER, {
	operation: function Trigger() {
		var DOM, cssPath = this.$case.$runExp(this.body('object')),
			param = {
				value: this.$case.$runExp(this.body('param'))
			},
			action = this.body('action');

		try {
			DOM = getDocument().querySelectorAll(cssPath)[0];
			if (!DOM) {
				throw 'Can not find a DOM by cssPath: ' + cssPath;
			}

			trigger(DOM).does(action, param);
			settings.triggerCallback(DOM, this.$case);
		} catch (msg) {
			console.log(msg);
			this.$case
				.$pushLog([TRIGGER, FAILURE, cssPath, action, param], this.line())
				.$setTempInstruction(IF(EXIT).create(false).assignCase(this.$case));

			return;
		}

		this.$case
			.$pushLog([TRIGGER, PASSED, cssPath, action, param], this.line());
	},
	bodyFactory: function (object, action, param) {
		return {
			object: object,
			action: action,
			param: param
		};
	}
});
IF(ASSERT, {
	operation: function Assert() {
		var startTime = _.now(),
			exp = this.body('exp'),
			timeout = this.body('timeout'),
			CASE = this.$case,
			ins = this;

		function queryHTMLElementByCSS() {
			// Call when timeout defined, and cancel temp instruction
			// when assert success.
			if (!CASE.$runExp(exp)) {
				return;
			}

			CASE.$setIdleTask()
				.$setTempInstruction()
				.$setActiveTime()
				.$pushLog([ASSERT, PASSED], ins.line())
				.$pushLogData(ins.body('key'), _.now() - startTime);
		}

		CASE.$setTempInstruction(IF(EXIT).create(false, function () {
			CASE.$pushLog([ASSERT, FAILURE], ins.line());
		}).assignCase(CASE));

		if (timeout && timeout > 2 * settings.defaultClock) {
			CASE.$setActiveTime(timeout)
				.$setIdleTask(queryHTMLElementByCSS);
		}

		if (CASE.$runExp(exp)) {
			// whatever timeout defined or not, it must be
			// asserted at first. So canel IdleTask & tempInstruction
			// when assert success.
			CASE.$setTempInstruction()
				.$setActiveTime()
				.$setIdleTask()
				.$pushLog([ASSERT, PASSED], this.line());

			if (timeout) {
				CASE.$pushLogData(ins.body('key'), 0);
			}
		}
	},
	bodyFactory: function (exp, timeout, dataKey) {
		return {
			exp: exp,
			timeout: timeout,
			key: dataKey
		};
	}
});
IF(JUMPTO, {
	operation: function JumpTo() {
		var url = this.$case.$runExp(this.body('url'));
		settings.contextFrame.src = url;
		this.$case.$pushLog([JUMPTO, url], this.line());
	}
});
IF(REFRESH, {
	operation: function Refresh() {
		getDocument().location.reload();
		this.$case.$pushLog([REFRESH], this.line());
	}
});

IF(LOG, {
	operation: function Log() {
		this.$case.$pushLog([LOG, this.$case.$runExp(this.body('msg'))]);
	},
	bodyFactory: function (msg) {
		return {
			msg: msg
		};
	}
});
IF(CONSOLE, {
	operation: function Console() {
		var msg = this.$case.$runExp(this.body('msg'));
		console.log(msg);
		settings.consoleFn(msg);
	},
	bodyFactory: function (msg) {
		return {
			msg: msg
		};
	}
});
