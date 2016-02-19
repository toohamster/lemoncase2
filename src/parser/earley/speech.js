function char (c){
	return function scanChar (inputChar){
		return inputChar === c;
	}
}

function range (regexp){
	return function scanRange (inputChar){
		return regexp.test(inputChar);
	}
}

function chars (c){
	return function scanChars (inputChar){
		return ~c.indexOf(inputChar);
	}
}

function not (c) {
	return function notChars (inputChar){
		return !~c.indexOf(inputChar);
	}
}

module.exports = {
	char: char,
	range: range,
	chars: chars,
	not: not
};