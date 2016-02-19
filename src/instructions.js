/*jslint sloppy: true, nomen: true */
/*global IF, settings, trigger, _, console, exitIns:true, callMainIns:true */
IF(0x00, {
	operation: function Call() {
		var identifer = this.body('identifer');

		this.$case
			.$pushScope(identifer)
			.$pushLog([13, 0, identifer], this.line());
	},
	bodyFactory: function (name) {
		return {
			identifer: name
		};
	}
});
IF(0x01, {
	operation: function Return() {
		this.$case.$popScope();
	},
	bodyFactory: function () {
		return {};
	}
});
IF(0x02, {
	operation: function Exit() {
		this.$case
			.$pushLog([100, 0], this.line())
			.$markLog(100, this.$case.getCurrentLoop())
			.$exitLoop();
	},
	bodyFactory: function (delay) {
		return {};
	}
});

IF(0x10, {
	operation: function Assign() {
		this.$case.$getCurrentScope().vars[this.body('identity')] =
			this.$case.$runExp(this.body('exp'));
	}
});
IF(0x11, {
	operation: function Wait() {
		this.$case
			.$setActiveTime(this.body('delay'))
			.$pushLog([0, 0, this.body('delay')], this.ling());
	},
	bodyFactory: function (delay) {
		return {
			delay: delay
		};
	}
});
IF(0x12, {
	operation: function Trigger() {
		var cssPath = this.$case.$runExp(this.body('object')),
			actionParam = this.$case.$runExp(this.body('param')),
			action = this.body('action'),
			DOM = _.document().querySelectorAll(cssPath)[0];

		if (!DOM) {
			throw new Error('Can not find a DOM by cssPath: ' + cssPath);
		}

		trigger(DOM).execute(action, actionParam);
		settings.triggerCallback.call(this.$case, DOM);

		this.$case
			.$pushLog([1, 0, cssPath, action, actionParam], this.line());
	},
	bodyFactory: function (object, action, param) {
		return {
			object: object,
			action: action,
			param: param
		};
	}
});
IF(0x13, {
	operation: function Assert() {
		var startTime = _.now(),
			exp = this.body('exp'),
			timeout = this.body('timeout'),
			CASE = this.$case;

		CASE.$setTempInstruction(IF(0x02).create());

		function queryHTMLElementByCSS() {
			if (CASE.$runExp(exp)) {
				CASE.$setIdleTask()
					.$setTempInstruction()
					.$setActiveTime()
					.$pushLog([2, 0], this.line())
					.$pushLogData(this.body('key'), _.now() - startTime);
			}
		}

		if (timeout) {
			CASE.$setActiveTime(timeout)
				.$setIdleTask(queryHTMLElementByCSS);
		}

		if (CASE.$runExp(exp)) {
			CASE.$setTempInstruction()
				.$pushLog([2, 0], this.line());
		}
	},
	bodyFactory: function (exp, timeout, dataKey) {
		return {
			exp: exp,
			timeout: timeout,
			dataKey: dataKey
		};
	}
});
IF(0x14, {
	operation: function JumpTo() {
		_.document().location.href = this.body('url');
		this.$case.$pushLog([3], this.line());
	}
});
IF(0x15, {
	operation: function Refresh() {
		_.document().location.reload();
		this.$case.$pushLog([4], this.line());
	}
});

IF(0x20, {
	operation: function Log() {
		this.$case.$pushLog([3, 0, this.$case.$runExp(this.body('msg'))]);
	},
	bodyFactory: function (msg) {
		return {
			msg: msg
		};
	}
});
IF(0x21, {
	operation: function Console() {
		console.log(this.$case(this.body('msg')));
	},
	bodyFactory: function (msg) {
		return {
			msg: msg
		};
	}
});
