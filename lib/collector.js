/*jslint vars: true, sloppy: true, nomen: true */
/*global now: false, _, instructions */

//1_SYSTEM 2_USER -1_ERROR 0_NOTICE
var Collector = function (dataKeys) {
	this.$$baseTime = 0;

	this.$dataKeys = dataKeys || [];
	this.$marks = [];
	this.$logs = [];
	this.$datas = {};
};

Collector.prototype.initialization = function () {
	this.clear();
	this.$$baseTime = _.now();

	_.forEach(this.$dataKeys, function (keyName) {
		this[keyName] = [];
	}, this.$datas);

	return this;
};

Collector.prototype.getLength = function (key) {
	return this['$' + key].length;
};

Collector.prototype.log = function (content, line) {
	this.$logs.push([content, _.now() - this.$$baseTime, line || 0]);

	return this;
};

Collector.prototype.data = function (key, value) {
	this.$datas[key].push(value);

	return this;
};

Collector.prototype.markLog = function (key, value) {
	this.$marks.push([key, value]);

	return this;
};

Collector.prototype.clear = function () {
	this.$$baseTime = 0;
	this.$marks.length = 0;
	this.$logs.length = 0;
	this.$datas.length = 0;

	return this;
};

Collector.prototype.export2json = function () {
	return {
		baseTime: this.$$baseTime,
		marks: this.$marks,
		logs: this.$logs,
		performance: this.$datas
	};
};

Collector.prototype.export2text = function () {
	return JSON.stringify(this.export2json());
};
