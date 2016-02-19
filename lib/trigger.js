/*jslint sloppy: true, plusplus: true */
/*global console, Window */
(function () {
	'use strict';
	var exports, actionRule,
		config = {
			contextIframe: null,
			window: function () {
				return config.contextIframe ? config.contextIframe.contentWindow : window;
			}
		},
		aUs = [],
		defaultEventOpts = {bubbles: true, cancelBubble: true},

		MouseEvent = 0x00,
		KeyboardEvent = 0x10,
		UIEvent = 0x20,
		InputEvent = 0x30,

		MOUSEUP = 0x00,
		MOUSEDOWN = 0x01,
		MOUSEENTER = 0x02,
		MOUSELEAVE = 0x03,
		MOUSEOUT = 0x04,
		MOUSEOVER = 0x05,
		MOUSEMOVE = 0x06,
		CLICK = 0x07,
		DBLCLICK = 0x08,
		CONTEXTMENU = 0x09,

		KEYUP = 0x10,
		KEYDOWN = 0X11,
		KEYPRESS = 0X12,

		SCROLL = 0x20,
		RESIZE = 0x21,
		FOCUS = 0x22,
		BLUR = 0x23,
		SELECT = 0x24,

		INPUT = 0x30;


	function isElement(obj) {
		return obj.nodeType === 1;
	}
	function isWindow(obj) {
		return obj instanceof Window;
	}
	function setHashKey(obj, h) {
		if (h) {
			obj.$$hashKey = h;
		} else {
			delete obj.$$hashKey;
		}
	}
	function baseExtend(dst, objs) {
		var ii, i, jj, j, key, src, obj, keys,
			h = dst.$$hashKey;

		for (i = 0, ii = objs.length; i < ii; ++i) {
			obj = objs[i];
			keys = Object.keys(obj);
			for (j = 0, jj = keys.length; j < jj; j++) {
				key = keys[j];
				src = obj[key];
				dst[key] = src;
			}
		}

		setHashKey(dst, h);
		return dst;
	}
	function extend(dst) {
		return baseExtend(dst, ([]).slice.call(arguments, 1), false);
	}

	function dispatchMouseEvent(element, eventName, opts) {
		element.dispatchEvent(new MouseEvent(eventName, extend({}, defaultEventOpts, opts)));
	}
	aUs[MOUSEUP] = function (opts) {
		dispatchMouseEvent(this, 'mouseup', opts);
	};
	aUs[MOUSEDOWN] = function (opts) {
		dispatchMouseEvent(this, 'mousedown', opts);
	};
	aUs[MOUSEENTER] = function (opts) {
		dispatchMouseEvent(this, 'mouseenter', opts);
	};
	aUs[MOUSELEAVE] = function (opts) {
		dispatchMouseEvent(this, 'mouseleave', opts);
	};
	aUs[MOUSEOUT] = function (opts) {
		dispatchMouseEvent(this, 'mouseout', opts);
	};
	aUs[MOUSEOVER] = function (opts) {
		dispatchMouseEvent(this, 'mouseover', opts);
	};
	aUs[MOUSEMOVE] = function (opts) {
		dispatchMouseEvent(this, 'mousemove', opts);
	};
	aUs[CLICK] = function (opts) {
		dispatchMouseEvent(this, 'click', opts);
		this.click();
	};
	aUs[DBLCLICK] = function (opts) {
		dispatchMouseEvent(this, 'dblclick', opts);
	};
	aUs[CONTEXTMENU] = function (opts) {
		dispatchMouseEvent(this, 'contextmenu', opts);
	};

	function dispatchKeyboardEvent(element, eventName, opts) {
		element.dispatchEvent(new KeyboardEvent(eventName, extend({}, defaultEventOpts, opts)));
	}
	aUs[KEYDOWN] = function (opts) {
		dispatchKeyboardEvent(this, 'keydown', opts);
	};
	aUs[KEYPRESS] = function (opts) {
		dispatchKeyboardEvent(this, 'keypress', opts);
	};
	aUs[KEYUP] = function (opts) {
		dispatchKeyboardEvent(this, 'keyup', opts);
	};

	aUs[FOCUS] = function () {
		this.focus();
	};
	aUs[BLUR] = function () {
		this.blur();
	};
	aUs[RESIZE] = function (opts) {
		var s = config.contextIframe.style;
		s.width = opts.width + 'px';
		s.height = opts.height + 'px';
	};
	aUs[SCROLL] = function (opts) {
		config.window().scrollTo(opts.x, opts.y);
		this.dispatchEvent(new UIEvent('scroll'));
	};
	aUs[SELECT] = function (opts) {
		var optionElement = this[opts.index];
		aUs[MOUSEDOWN].call(optionElement, opts);
		aUs[MOUSEUP].call(optionElement, opts);
		optionElement.selected = true;
		this.dispatchEvent(new UIEvent('select'));
		aUs[CLICK].call(optionElement, opts);
		aUs[MOUSEOUT].call(optionElement, opts);

	};

	aUs[INPUT] = function (opts) {
		this.value = opts.value;
		this.dispatchEvent(new InputEvent('input', opts));
	};

	function Trigger(element) {
		this.element = element;
		this.action = this.$getActionRule(element);
	}
	Trigger.prototype.$getActionRule = function (element) {
		if (element instanceof Window) {
			return actionRule.window;
		}

		if (element.tagName.toLowerCase() === 'input') {
			return actionRule['input/' + element.type];
		}

		if (element.tagName.toLowerCase() === 'textarea') {
			return actionRule.textarea;
		}


		if (element.tagName.toLowerCase() === 'select') {
			return actionRule.select;
		}

		return actionRule.generic;
	};
	Trigger.prototype.does = function (actionName, options) {
		var i, len, rule;

		if (this.testAction(actionName) !== true) {
			throw 'The element:' + this.element.outerHTNL +
				' can not use action:' + actionName;
		}

		rule = this.action[actionName];
		len = rule.length;
		for (i = 0; i < len; i += 1) {
			aUs(rule[i]).call(this.element, options);
		}

		return this;
	};
	Trigger.prototype.testAction = function (actionName) {
		return this.action.hasOwnProperty(actionName);
	};

	actionRule = (function () {
		var rule = {};

		rule.generic = {
			click: [MOUSEDOWN, MOUSEMOVE, MOUSEUP, CLICK],
			dblclick: [MOUSEDOWN, MOUSEUP, CLICK, MOUSEDOWN, MOUSEUP, CLICK, DBLCLICK],
			rclick: [MOUSEDOWN, MOUSEUP, CONTEXTMENU],
			movein: [MOUSEOVER, MOUSEOUT],
			moveout: [MOUSEMOVE, MOUSEOUT],
			scroll: [SCROLL]
		};

		rule.textarea = rule['input/text'] = rule['input/password'] =
			rule['input/email'] = extend({}, rule.generic, {
				input: [KEYDOWN, KEYPRESS, INPUT, KEYUP],
				click: [MOUSEDOWN, FOCUS, MOUSEMOVE, MOUSEUP, CLICK],
				dblclick: [MOUSEDOWN, FOCUS, MOUSEMOVE, MOUSEUP, CLICK, MOUSEDOWN,
						   MOUSEMOVE, MOUSEUP, CLICK, DBLCLICK],
				rclick: [MOUSEDOWN, FOCUS, MOUSEUP, CONTEXTMENU]
			});

		rule.select = extend({}, rule.generic, {
			select: [MOUSEDOWN, FOCUS, MOUSEMOVE, MOUSEUP, CLICK, MOUSEMOVE,
					 MOUSEOUT, SELECT, BLUR]
		});

		rule.window = {
			scroll: [SCROLL],
			resize: [RESIZE]
		};

		return rule;
	}());

	console.log(actionRule);

	exports = function (element) {
		if (!isWindow(element) && !isElement(element)) {
			console.error(element);
			throw '"element" for trigger must be a HTMLElement';
		}
		return new Trigger(element);
	};

	window.t = exports;
	return exports;
}());
