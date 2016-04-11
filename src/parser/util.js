function isArray(obj) {
	return Object.prototype.toString.call(obj) === "[object Array]";
}

// Checks if an object has a property.

function has(obj, propName) {
	return Object.prototype.hasOwnProperty.call(obj, propName);
}

module.exports = {
	isArray: isArray,
	has: has
};
