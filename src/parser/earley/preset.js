var char = require('./speech.js').char;
var range = require('./speech.js').range;
var chars = require('./speech.js').chars;
var not = require('./speech.js').not;

function skip (){}
function join (arg){
	return arg.join('');
}

module.exports = {
	string: [
		
	],
	number: [],
	regex: [
		{
			name: 'Regex',
			rule: [char('/'), '$regexInner', char('/'), '$regexFlag'],
			cb: function (arg) {
				return {
					pattern: arg[1],
					flag: arg[3]
				};
			}
		}, {
			name: '$regexFlag',
			rule: []
		}, {
			name: '$regexFlag',
			rule: [range(/[gim]/), '$regexFlag'],
			cb: join
		}, {
			name: '$regexInner',
			rule: ['$regex001', '$regexInner'],
			cb: join
		}, {
			name: '$regexInner',
			rule: ['$regex001'],
			cb: join
		}, {
			name: '$regex001',
			rule: [range(/[^/\n]/)]
		}, {
			name: '$regex001',
			rule: [char('['), '$regex002', char('/'), '$regex002' ,char(']')]
		}, {
			name: '$regex002',
			rule: []
		}, {
			name: '$regex002',
			rule: [not(']'), '$regex002'],
			cb: join
		}
	],
	//non optional white space
	space: [
		{
			name: 'Space',
			rule: [range(/\s/)]
		}, {
			name: 'Space',
			rule: ['Space', range(/\s/)],
			cb: skip
		}
	],
	//grammar for testing purpose
	testRule: [
		{
			name: 'Sum',
			rule: ['Sum', chars('+-'), 'Product'],
			cb: function (arg) {
				return {
					left: arg[0],
					op: arg[1],
					right: arg[2]
				}
			}
		}, {
			name: 'Sum',
			rule: ['Product']
		}, {
			name: 'Product',
			rule: ['Product', chars('*/'), 'Factor'],
			cb: function (arg) {
				return {
					left: arg[0],
					op: arg[1],
					right: arg[2]
				}
			}
		}, {
			name: 'Product',
			rule: ['Factor']
		}, {
			name: 'Factor',
			rule: [char('('), 'Sum', char(')')],
			cb: function (arg){
				return arg[1];
			}
		}, {
			name: 'Factor',
			rule: ['Number'],
			cb: function (arg) {
				return {
					type: 'number',
					value: Number(arg)
				}
			}
		}, {
			name: 'Number',
			rule: [range(/\d/), 'Number'],
			cb: join
		}, {
			name: 'Number',
			rule: [range(/\d/)]
		}
	],
	testEmpty: [
		{
			name: 'A',
			rule: []
		}, {
			name: 'A',
			rule: ['B']
		}, {
			name: 'B',
			rule: ['A']
		}, {
			name: 'Empty',
			rule: ['A'],
			cb: function (arg){
				if (arg[0]) {
					throw 'it should be empty';
				}
				
				return null;
			}
		}
	]
};