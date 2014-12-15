define(function (require) {
	var mod_nav = require("navigation");
	var nav = mod_nav.init();
	nav.prependTo($("body"));
});