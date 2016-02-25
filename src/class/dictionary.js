/*jslint vars: true, sloppy: true, nomen: true */
/*global workCycle: false, instructions, _: false */
/**
 * Dictionary use to input action when data type is "index".
 *
 * To create a dictionary which has 2 field with 3 assignments.
 *
 *     var dict = new Dictionary({
 *       field: [
 *         {name: "username", pattern: /zjm\d{6}/, comment: "comment_1"},
 *         {name: "password", pattern: /\d{8}/, comment: "comment_2"}
 *       ],
 *       assignment: [
 *         ["lichao", "lichaopass"],
 *         ["shiweilin", "shiweilinpass"],
 *         ["liyueyu", "liyueyupass"]
 *       ]
 *     });
 *
 * @class Dictionary
 * @constructor
 * @extends Entity
 * @param {object} options
 * @param {object} options.id
 * @param {object} options.name
 * @param {object} options.comment
 * @param {object} options.createtime
 * @param {object} options.updatetime
 * @param {object} options.field
 * @param {object} options.assignment
 */
function Dictionary(options) {
	if (!(this instanceof Dictionary)) {
		return new Dictionary(options);
	}

	this.$options = {};

	/**
	 * Cache a builder result in it.
	 *
	 * @property $$buffer
	 * @type array
	 * @private
	 * @default []
	 */
	this.$$buffer = [];
	/**
	 * Specific value list
	 *
	 * @property $assignment
	 * @type array
	 * @private
	 * @default []
	 */
	this.$assignment = [];
	/**
	 * Field configuration.
	 *
	 * @property $field
	 * @type array
	 * @private
	 * @default []
	 */
	this.$field = [];

	this.field(options.field);
	this.assignment(options.assignment);
}

/**
 * The getter/setter of the property "field".
 *
 * @method field
 * @param {array} [field]
 * @return {array} The fields of this "dictionary".
 * @example
 *
 *     dict.field();
 *     dict.field(1000);
 */
Dictionary.prototype.field = function (field) {
	if (_.isArray(field)) {
		this.$field = field;
	}
	this.$options.field = this.$field;
	return this.$field;
};

/**
 * The getter/setter of the property "assignment".
 *
 * @method assignment
 * @param {array} [assignment]
 * @return {array} The assignments of this "dictionary".
 * @example
 *
 *     step.assignment();
 *     step.assignment(1000);
 */
Dictionary.prototype.assignment = function (assignment) {
	if (_.isArray(assignment)) {
		this.$assignment = assignment;
	}
	this.$options.assignment = this.$assignment;
	return this.$assignment;
};

/**
 * To load in buffer by assignment & fields.
 *
 * @method load
 * @param {number} length The length of dictionary.
 * @return {Dictionary} this
 * @chainable
 * @example
 *
 *     dict.load(10);
 */
Dictionary.prototype.load = function (length) {
	var i, len = this.$assignment.length,
		keys = this.getKeys(),
		len_of_fields = keys.length;

	var Row = function (row_array) {
		_.forEach(keys, function (field, index) {
			this[field.name] = row_array[index];
		}, this);
	};
	var RandRow = function () {
		_.forEach(keys, function (field) {
			this[field.name] = field.pattern.gen;
		}, this);
	};

	this.$$buffer = [];
	// load assignment.
	for (i = 0; i < len && i < length; i += 1) {
		this.$$buffer.push(new Row(this.$assignment[i]));
	}
	// load rand row.
	for (null; i < length; i += 1) {
		this.$$buffer.push(new RandRow());
	}

	return this;
};

/**
 * Get all fields config of this "dictionary".
 *
 * @method getKeys
 * @return {array} keys
 * @example
 *
 *     dict.getKeys();
 */
Dictionary.prototype.getKeys = function () {
	var keys = [];
	_.forEach(this.$field, function (field) {
		this.push({
			name: field.name,
			pattern: new RegExp(field.pattern)
		});
	}, keys);

	return keys;
};

/**
 * Get one row from $$buffer in front.
 *
 * @method fetch
 * @return {object} One row in $$buffer.
 * @example
 *
 *     dict.fetch();
 */
Dictionary.prototype.fetch = function () {
	return this.$$buffer.shift();
};

Dictionary.prototype.isFieldDefined = function (name) {
	var i, len = this.$field.length;

	for (i = 0; i < len; i += 1) {
		if (this.$field[i].name === name) { return true; }
	}

	return false;
};
