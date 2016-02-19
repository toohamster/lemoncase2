/*jslint vars: true, sloppy: true, nomen: true */
/*global $CP, _: false, settings, Dictionary */

$CP.hasDictionary = function () {
	return this.$dictionary !== undefined;
};

$CP.validateObjectList = function (objectList, keysUsed) {
    if (!keysUsed.length) {
        return true;//未使用原件
    }

    if (!objectList) {
        return false;//使用了元件但没有引元件库
    }

	return keysUsed.every(function (key) {
		//null or undefined => fail
		//0, NaN, '' ... => success
		return objectList[key] !== null;
	});
};

$CP.exportLog = function (type) {
	return this.$$collector['export2' + type]();
};

$CP.start = function () {
	var state = this.$$state;
	if (state !== 'success' && state !== 'ready') {
		throw new Error('Can not call play!');
	}
	this.$setState('running').$$bootstrap();
	//todo
	setTimeout(function () {
		this.$$core();
	}.bind(this), settings.defaultReadyTimeout);

	return this;
};

$CP.suspend = function () {
	if (this.$$state !== 'running') {
		throw new Error('Can not call pause!');
	}
	this.$setState('pause').$$interrupt();

	return this;
};

$CP.resume = function () {
	if (this.$$state !== 'pause') {
		throw new Error('Can not call resume!');
	}
	this.$setState('running').$$core();

	return this;
};

$CP.stop = function () {
	var state = this.$$state;
	if (state !== 'running' && state !== 'pause') {
		throw new Error('Can not call stop!');
	}
	this.$setState('ready').$$interrupt();

	return this;
};

$CP.debug = function () {
	var state = this.$$state;
	if (state !== 'success' && state !== 'ready') {
		throw new Error('Can not call play!');
	}
	this.$setState('debug').$$bootstrap();

	return this;
};

$CP.dictionary = function (dictionary) {
	if (dictionary instanceof Dictionary) {
		this.$dictionary = dictionary;
	}

	return this.$dictionary;
};

$CP.getLog = function () {
	return this.$$log;
};

$CP.getCurrentStep = function () {
	return this.$$counter;
};

$CP.getCurrentLoop = function () {
	return this.$$currentLoop;
};

$CP.getCurrentLine = function () {
	return this.$$instructionBuffer.$getLine();
};
