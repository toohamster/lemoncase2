/*jslint vars: true, sloppy: true, nomen: true */
/*global angular, Case, setup, trigger, syntaxTree, console, LP */
var app = angular.module('testPanel', [
	'lemoncase'
]).run(function ($rootScope) {
	var iframe = document.querySelector('iframe');
//	$rootScope.iframe = iframe;
//	setup.setContextFrame(iframe);
}).controller('panel', function ($scope, $element, LC) {
	$scope.iframe = LC.getLemoncaseFrame();

	var object = {
		button: '[type=button]'
	}, dictionary = new LC.Dictionary({
		field: [
			{
				name: 'word',
				pattern: /\w{4,8}/
			}
		]
	});

	LC.init($element[0].querySelector('#project'), function (){
		this.src = 'test.html';
	});

	$scope.actionParam = {
		value: ''
	};
	$scope.opts = {
		selector: '',
		action: ''
	};

	$scope.trigger = null;

	$scope.getActionOfDOM = function () {
		var e = $scope.iframe.contentWindow.document.querySelector($scope.opts.selector);
		$scope.DOMActions = trigger(e).getActionRule();
	};

	$scope.fire = function () {
		var e = $scope.iframe.contentWindow.document.querySelector($scope.opts.selector);
		$scope.trigger = trigger(e).does($scope.opts.action, $scope.actionParam);
	};

	$scope.selectors = {
		textInput: 'input',
		emailInput: 'input[type=email]',
		passwordInput: 'input[type=password]',
		textarea: 'textarea',
		buttonInput: 'input[type=button]',
		a: 'a',
		select: 'select'
	};

	$scope.caseList = {
		console: {
			"main": {
				"LINE": 5,
				"TYPE": 2730,
				"BODY": {
					"segment": [
						{ // a = '变量a';
							"TYPE": 0x10,
							"BODY": {
								"exp": function ($, o, d, c, t) {
									return ($.a = '变量a');
								}
							}
						},
						{ // console a + '输出';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return $.a + '输出';
								}
							}
						},
						{ // return;
							"TYPE": 0x01,
							"LINE": 10
						}
					]
				}
			}
		},
		trig: {
			main: {
				"LINE": 5,
				"TYPE": 2730,
				"BODY": {
					"segment": [
						{ // a = '变量a';
							"TYPE": 0x10,
							"BODY": {
								"exp": function ($, o, d, c, t) {
									return ($.a = '变量a');
								}
							}
						},
						{ // b = 1500;
							"TYPE": 0x10,
							"BODY": {
								"exp": function ($, o, d, c, t) {
									return ($.b = 500);
								}
							}
						},
						{ // console '等500';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '等500';
								}
							}
						},
						{ // wait b;
							"TYPE": 0x11,
							"BODY": {
								delay: function ($, o, d, c, t) {
									return ($.b);
								}
							}
						},
						{ // console '/等500';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '/等500仿真';
								}
							}
						},
						{ // click 'textarea';
							"TYPE": 0x12,
							"BODY": {
								action: 'click',
								'object': function () {
									return 'textarea';
								},
								param: function ($, o, d, c, t) {
									return '';
								}
							}
						},
						{ // input 'textarea' by a + '直接量';
							"TYPE": 0x12,
							"BODY": {
								action: 'input',
								'object': function () {
									return 'textarea';
								},
								"param": function ($) {
									return $.a + '直接量';
								}
							}
						},
						{ // console '干完';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '干完';
								}
							}
						},
						{ // return;
							"TYPE": 0x01,
							"LINE": 10
						}
					]
				}

			}
		},
		brower: {
			main: {
				"LINE": 5,
				"TYPE": 2730,
				"BODY": {
					"segment": [
						{ // a = 'http://baidu.com';
							"TYPE": 0x10,
							"BODY": {
								"exp": function ($, o, d, c, t) {
									return ($.a = 'http://baidu.com');
								}
							}
						},
						{ // b = 'http://localhost/LemonCase2/test/test.html';
							"TYPE": 0x10,
							"BODY": {
								"exp": function ($, o, d, c, t) {
									return ($.b = 'http://localhost/LemonCase2/test/test.html');
								}
							}
						},
						{ // console '跳a等2500';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '跳a等2500';
								}
							}
						},
						{ // jumpto a;
							"TYPE": 0x14,
							"BODY": {
								url: function ($, o, d, c, t) {
									return ($.a);
								}
							}
						},
						{ // wait 2500;
							"TYPE": 0x11,
							"BODY": {
								delay: function ($, o, d, c, t) {
									return (2500);
								}
							}
						},
						{ // console '跳b';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '/等500仿真';
								}
							}
						},
						{ // jumpto b;
							"TYPE": 0x14,
							"BODY": {
								url: function ($, o, d, c, t) {
									return ($.b);
								}
							}
						},
						{ // console '干完';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '干完';
								}
							}
						},
						{ // return;
							"TYPE": 0x01,
							"LINE": 10
						}
					]
				}
			}
		},
		assert: {
			main: {
				"LINE": 5,
				"TYPE": 2730,
				"BODY": {
					"segment": [
						{ // refresh;
							"TYPE": 0x15,
							"BODY": {}
						},
						{ // wait 1000;
							"TYPE": 0x11,
							"BODY": {
								delay: function ($, o, d, c, t) {
									return (1000);
								}
							}
						},
						{ // a = 'input[type=button]';
							"TYPE": 0x10,
							"BODY": {
								"exp": function ($, o, d, c, t) {
									return ($.a = 'input[type=button]');
								}
							}
						},
						{ // click a;
							"TYPE": 0x12,
							"BODY": {
								action: 'click',
								object: function ($, o, d, c, t) {
									return $.a;
								},
								param: function () {
									return '';
								}
							}
						},
						{ // console '触发按钮等5秒钟内的断言';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '触发按钮等5秒钟内的断言';
								}
							}
						},
						{ // assert <@'span'/> == ’出现了‘ in 5000;
							"TYPE": 0x13,
							"BODY": {
								exp: function ($, o, d, c, t) {
									return t('span') == '出现了';
								},
								timeout: 5000,
								key: '#0'
							}
						},
						{ // console '断言通过结束';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '断言通过结束';
								}
							}
						},
						{ // return;
							"TYPE": 0x01,
							"LINE": 10
						}
					]
				}
			}
		},
		call: {
			main: {
				"LINE": 5,
				"TYPE": 2730,
				"BODY": {
					"segment": [
						{ // refresh;
							"TYPE": 0x15,
							"BODY": {}
						},
						{ // wait 1000;
							"TYPE": 0x11,
							"BODY": {
								delay: function ($, o, d, c, t) {
									return (1000);
								}
							}
						},
						{ // a = 'input[type=button]';
							"TYPE": 0x10,
							"BODY": {
								"exp": function ($, o, d, c, t) {
									return ($.a = 'input[type=button]');
								}
							}
						},
						{ // click a;
							"TYPE": 0x12,
							"BODY": {
								action: 'click',
								object: function ($, o, d, c, t) {
									return $.a;
								},
								param: function () {
									return '';
								}
							}
						},
						{ // showAssert();
							"TYPE": 0x00,
							"BODY": {
								"identifer": 'assertShow'
							}
						},
						{ // console '结束了';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '结束了';
								}
							}
						},
						{ // return;
							"TYPE": 0x01,
							"LINE": 10
						}
					]
				}
			},
			assertShow: {
				"TYPE": 2730,
				"BODY": {
					"segment": [
						{ // console '触发按钮等5秒钟内的断言';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '触发按钮等5秒钟内的断言';
								}
							}
						},
						{ // assert <@'span'/> == ’出现了‘ in 5000;
							"TYPE": 0x13,
							"BODY": {
								exp: function ($, o, d, c, t) {
									return t('span') == '出现了';
								},
								timeout: 5000,
								key: '#0'
							}
						},
						{ // console '断言通过结束';
							"TYPE": 0x21,
							"BODY": {
								"msg": function ($) {
									return '断言通过结束';
								}
							}
						},
						{ // return;
							"TYPE": 0x01,
							"LINE": 10
						}
					]
				}
			}
		},
		all: {
			main: {
				BODY: {
					segment: [
						{
							TYPE: 0x10,
							BODY: {
								exp: function ($) {
									return ($.a = 'http://localhost/lemonCase2/test/test.html');
								}
							}
						},
						{
							TYPE: 0x14,
							BODY: {
								url: function ($) {
									return $.a;
								}
							}
						},
						{
							TYPE: 0x21,
							BODY: {
								msg: function () {
									return '等2秒';
								}
							}
						},
						{
							TYPE: 0x11,
							BODY: {
								delay: function () {
									return 2000;
								}
							}
						},
						{
							TYPE: 0x21,
							BODY: {
								msg: function () {
									return '准备点按钮';
								}
							}
						},
						{
							TYPE: 0x10,
							BODY: {
								exp: function ($, o, d) {
									return ($.b = 'input' + o.button);
								}
							}
						},
						{
							TYPE: 0x12,
							BODY: {
								object: function ($, o, d) {
									return $.b;
								},
								action: 'click',
								param: function () {}
							}
						},
						{
							TYPE: 0x13,
							BODY: {
								timeout: 5000,
								key: '#0',
								exp: function ($, o, d, c, t) {
									return (t('span') == '出现了');
								}
							}
						},
						{
							TYPE: 0x21,
							BODY: {
								msg: function ($) {
									return ($.b + '的点击后断言成功');
								}
							}
						},
						{
							TYPE: 0x00,
							BODY: {
								identifer: 'inputTextarea'
							}
						},
						{
							TYPE: 0x01,
							BODY: {}
						}
					]
				}
			},
			inputTextarea: {
				BODY: {
					segment: [
						{
							TYPE: 0x12,
							BODY: {
								action: 'click',
								object: function () {
									return 'textarea';
								}
							}
						},
						{
							TYPE: 0x12,
							BODY: {
								action: 'input',
								object: function () {
									return 'textarea';
								},
								param: function ($, o, d) {
									return ((/\d{4}/.gen) + d.word);
								}
							}
						},
						{
							TYPE: 0x13,
							BODY: {
								exp: function ($, o, d, c, t) {
									return (/\d{4}\w+/).test(t('h1').match);
								}
							}
						},
						{
							TYPE: 0x21,
							BODY: {
								msg: function () {
									return '验证约等于';
								}
							}
						},
						{
							TYPE: 0x01,
							BODY: {}
						}
					]
				}
			}
		}
	};

	$scope.load = function (casePatch) {
		syntaxTree.PROCESSES = casePatch;
	};

	$scope.linkCase = function () {
		console.log('--------- Link test case --------------');
		
		var ast = LC.parse($codeMirror.getValue(), {});
		console.log(ast);
		var c = new LC.Case(ast, object, dictionary);
		window.$case = c;
	};

	$scope.bootCase = function () {
		console.log('--------- boot test case --------------');
		window.$case.$$bootstrap();
	};

	$scope.coreCase = function () {
		console.log('--------- core test case --------------');
		window.$case.$$core();
	};

	$scope.start = function () {
		window.$case.start();
	};
	$scope.pause = function () {
		window.$case.suspend();
	};
	$scope.resume = function () {
		window.$case.resume();
	};
	$scope.stop = function () {
		window.$case.stop();
	};
	
	// code mirror
	var $codeMirror;
	
	function setupCM () {
		$codeMirror = CodeMirror.fromTextArea($element.find('textarea')[0], {
			lineWrapping : true,
			lineNumbers: true,
			indentWithTabs: true,
			indentUnit: 4,
			mode: 'text/x-php'
		});
		
		$codeMirror.setValue("#TIMES 10\nprocess main {\nvar a = '[type=email]';\ninput 'input' + a by |\\d|;\nclick 'body > input:nth-child(5)';\n}");
		$codeMirror.refresh();
		$codeMirror.setSize('100%', '100%');
	}
	
	setupCM();
});
