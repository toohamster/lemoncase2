var EarleyItem = require('./earley-item.js');
var nullableRules = require('./nullable.js');

var basicGrammar = [];

//helper functions
function pushBack (array, item){
	array[array.length] = item;
}

function addToSet (array, newItem){
	var index = -1,
		length = array.length;
		
	while (++index < length){
		if (array[index].equal(newItem)) {
			return;
		}
	}
	
	pushBack(array, newItem);
}

function ProtoParser (grammar, startRuleName){
	this.grammar = basicGrammar.concat(grammar);
	this.startRuleName = startRuleName;
}

ProtoParser.prototype = {
	parse: function (input, options){
		this.input = String(input);
		
		this.options = options != null
						? options
						: {};
		
		this.buildItems();
		//console.log();
		
		return this.finish();
	},
	buildItems: function (){
		//detect nullable rules
		this.nss = nullableRules(this.grammar);
		//Earley state sets
		var set = [[]], startRuleName = this.startRuleName;
		//put start items in set[0]
		this.grammar.forEach(function (ruleTable){
			if (ruleTable.name === startRuleName) {
				pushBack(set[0], new EarleyItem(ruleTable, 0, 0));
			}
		});
		//populate the rest of set[i]
		var i = 0;
		while (i < set.length) {
			var j = 0;
			while (j < set[i].length) {
				var symbol = set[i][j].nextSymbol();
				if (!symbol) {
					this.complete(set, i, j);//state complete
				} else if (typeof(symbol) === 'function') {
					this.scan(set, i, j, symbol);//terminal
				} else if (typeof(symbol) === 'string') {
					this.predict(set, i, j, symbol);//non-terminal
				} else {
					throw new Error('illegal rule');
				}
				j++;
			}
			i++;
		}
		//debug
		this.position = i;
		this.chart = set;
		
		return this;
	},
	finish: function (){
		var resultStates = this.chart[this.chart.length - 1],
			index = -1,
			length = resultStates.length,
			item,
			partialState
			;
			
		while (++index < length){
			item = resultStates[index];
			
			if (item.getName() === this.startRuleName && item.start === 0){
				if (item.next === item.ruleTable.rule.length && item.data.length > 0) {
					return item.data[0];
				} else if (!partialState) {
					partialState = item;
				}
			}
		}
		//no result found, parse fail
		throw 'no state';
	},
	predict: function (chart, i, j, symbol){
		var nss = this.nss;
		
		this.grammar.forEach(function (ruleTable) {
			if (ruleTable.name === symbol) {
				addToSet(chart[i], new EarleyItem(ruleTable, 0, i));
				
				//magical complete
				if (nss[symbol]) {
					var item = chart[i][j];
					addToSet(chart[i], item.nextState());
				}
			}
		});
		
		return this;
	},
	scan: function (chart, i, j, partOfSpeech){
		var item = chart[i][j], character = this.input[i];
		
		if (character === undefined) {
			//end of file, no more scan
			return this;
		}

		if (partOfSpeech(character)) {
			if (chart[i + 1] == null) {
				chart[i + 1] = [];
			}
			pushBack(chart[i + 1], item.nextState(character));
		}
		
		return this;
	},
	complete: function (set, i, j){
		var item = set[i][j];
		item.packData(this);

		set[item.start].forEach(function (oldItem) {
			if (oldItem.nextSymbol() === item.getName()) {
				addToSet(set[i], oldItem.nextState(item.data));
			}
		});
	},
};

module.exports = {
	create: function (grammar, startRuleName){
		return new ProtoParser(grammar, startRuleName);
	},
	use: function (gr) {
		basicGrammar = basicGrammar.concat(gr);
	}
}