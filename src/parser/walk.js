// walk a javascript style tree and transform it into a function


module.exports = function genExpr (node) {
	var string = (function c(node){
		return '';
	})(node);
	
	return new Function('$,o,d,c,t', 'return throw "todo"');
};