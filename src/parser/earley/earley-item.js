var EarleyItem = function (ruleRef, symbolIndex, startPosition) {
	this.ruleTable = ruleRef;
	this.next = symbolIndex;
	this.start = startPosition;
	this.data = [];
};

EarleyItem.prototype.equal = function (them){
	return this.ruleTable === them.ruleTable
		&& this.next === them.next
		&& this.start === them.start;
};

EarleyItem.prototype.nextState = function (newData){
	var newItem = new EarleyItem(this.ruleTable, this.next + 1, this.start);
	newItem.data = this.data.concat(newData);
		
	return newItem;
};

EarleyItem.prototype.packData = function (parser){
	var fn = this.ruleTable.cb;
	
	if (fn) {
		var packed = fn.call(parser, this.data);
		this.data = packed !== undefined ? [packed] : [];
	}
	
	return this;
};

EarleyItem.prototype.nextSymbol = function (){
	return this.ruleTable.rule[this.next];
};

EarleyItem.prototype.getName = function () {
	return this.ruleTable.name;
};

module.exports = EarleyItem;