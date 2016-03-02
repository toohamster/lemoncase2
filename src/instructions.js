/*jslint sloppy: true, nomen: true */
/*global IF, settings, trigger, _, console, exitIns:true, callMainIns:true */
var CALL = 0x00,
	RETURN = 0x01,
	EXIT = 0x02,

	EXPRESSION = 0x10,
	WAIT = 0x11,
	TRIGGER = 0x12,
	ASSERT = 0x13,
	JUMPTO = 0x14,
	REFRESH = 0x15,

	LOG = 0x20,
	CONSOLE = 0x21;

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
		this.$case.$popScope();
	},
	bodyFactory: function () {
		return {};
	}
});
IF(EXIT, {
	operation: function Exit() {
		var flag = this.body('isSuccess') ? 'P' : 'F',
			CASE = this.$case;

		CASE.$pushLog([EXIT], this.line())
			.$markLog(flag, CASE.getCurrentLoop())
			.$exitLoop();
	},
	bodyFactory: function (isSuccess) {
		return {
			isSuccess: isSuccess
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
		var cssPath = this.$case.$runExp(this.body('object')),
			param = {
				value: this.$case.$runExp(this.body('param'))
			},
			action = this.body('action'),
			DOM = _.document().querySelectorAll(cssPath)[0];

		if (!DOM) {
			this.$case
				.$setTempInstruction(IF(EXIT).create(false).assignCase(this.$case));

			console.log('Can not find a DOM by cssPath: ' + cssPath);
			return;
		}

		trigger(DOM).does(action, param);
		settings.triggerCallback.call(this.$case, DOM);

		this.$case
			.$pushLog([TRIGGER, cssPath, action, param], this.line());
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
				.$pushLog([ASSERT], ins.line())
				.$pushLogData(ins.body('key'), _.now() - startTime);
		}

		CASE.$setTempInstruction(IF(EXIT).create(false).assignCase(CASE));

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
				.$pushLog([ASSERT], this.line());
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
		settings.contextFrame.src = _.document().location.href;
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
