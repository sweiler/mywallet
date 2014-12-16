define(function (require, exports) {
	var mod_nav = require("navigation");
	var parser = require("urlparser");
	
	var homepage = require("homepage");
	var entries = require("entries");
	
	var pages = {
			"entries" : entries
	};
	
	var nav = mod_nav.init();
	
	nav.prependTo($("body"));
	
	exports.urlChange = function (id, params) {
		mod_nav.setActive(id);
		$("#main").text("");
		var p = pages[id];
		if(p === undefined)
			p = homepage;
		$("#main").append(p.view());
	};
	
	parser.init();
});