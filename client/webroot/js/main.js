define(function (require, exports) {
	var mod_nav = require("navigation");
	var parser = require("urlparser");
	
	// Pages
	var homepage = require("homepage");
	var entries = require("entries");
	var login = require("login");
	
	var pages = {
			"login" : login,
			"entries" : entries
	};
	
	var logged_in = null;
	
	var nav = mod_nav.init();
	
	var current_view = null;
	
	exports.urlChange = function (id, params) {
		if(logged_in != null) {
			$("body").removeClass("login");
			nav.prependTo($("body"));
			mod_nav.setUser(logged_in);
		} else {
			$("body").addClass("login");
			nav.detach();
		}
		mod_nav.setActive(id);
		if(current_view != null)
			current_view.detach();
		if(logged_in == null) {
			p = login;
		} else {
			p = pages[id];
			if(p === undefined) {
				p = homepage;
			}
		}
		current_view = p.view();
		$("#main").append(current_view);
	};
	
	exports.setUser = function (user) {
		logged_in = user;
		
		if(window.localStorage !== undefined) {
			if(user != null)
				window.localStorage["user"] = JSON.stringify(user);
			else
				window.localStorage.removeItem("user");
		}
		
		parser.update();
	};
	
	if(window.localStorage !== undefined) {
		var str = window.localStorage["user"];
		if(str == null)
			logged_in = null;
		else
			logged_in = JSON.parse(str);
	}
	
	parser.init();
});