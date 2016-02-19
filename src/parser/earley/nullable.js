function nullableRules (grammar){
	var nss = Object.create(null),
		size = 0;
	nss.size = 0;
	
	do {
		size = nss.size;
		updateNss(grammar, nss);
	} while (size !== nss.size);
	
	return nss;
}

function updateNss (grammar, nss){
	grammar.forEach(function (ruleTable){
		if (isNullable(ruleTable.rule, nss)) {
			addNullable(ruleTable.name, nss);
		}
	});
}

function isNullable (rule, nss){
	var i = -1, length = rule.length;
	
	while (++i < length){
		if (!nss[rule[i]]) {
			return false;
		}
	}
	
	return true;
}

function addNullable (ruleName, nss){
	if (nss[ruleName]) return;
	
	nss[ruleName] = true;
	nss.size++;
}

module.exports = nullableRules;