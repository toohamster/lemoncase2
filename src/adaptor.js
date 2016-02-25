/*!
// lemoncase v1.0.1
// Copyright 2015 OrChange Inc. All rights reserved.
// Licensed under the GPL License.*/

/*jslint nomen: true, vars: true */
/*global define, module, angular, setup, Case, Instruction */
(function (root, factory) {
	'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
		module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD you should modify like this
        define([], factory);
    } else if (typeof angular === 'object' && typeof angular.module === 'function') {
		var LC = factory();
		angular.module('lemoncase', []).provider('LC', function () {
			this.setup = LC.setup;

			this.$get = [function () {
				return LC;
			}];
		});
	} else {
        // Global Variables
        window.LC = factory();
    }
}(this, function () {
	'use strict';
	//= include ../test/parser.js
	//= include ../lib/*.js
	//= include ./global.js
	//= include ./class/dictionary.js
	//= include ./class/instruction.js
	//= include ./class/case.js
	//= include ./class/case_P.js
	//= include ./class/case_I.js
	//= include ./instructions.js

	return {
		Case: Case,
		setup: setup,
		Instruction: IF,
		parse: LP.parse,
		Dictionary: Dictionary
	};
}));
