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
	regex: [],
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
			cb: function (arg){
				return arg[0] + arg[1];
			}
		}, {
			name: 'Number',
			rule: [range(/\d/)]
		}
	]
};