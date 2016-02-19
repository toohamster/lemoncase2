function Parser (options, input) {
	this.input = String(input);
	this.options = options;
	
	this.pos = 0;
	this.type = '';
	this.value = null;
	this.start = this.end = this.pos;
}

Parser.prototype = {
	
};

module.exports = Parser;