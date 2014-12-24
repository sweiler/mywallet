define(function (require, exports) {
	var app = require("main");
	var storage = require("storage");
	var obj = $("<ul class=\"nav navbar-nav\"></ul>");
	var nav_entries = {};
	var logout_link = null;
	var username = null;

	var headerStr = "<div class=\"navbar-header brand-header\">" +
		
		"<a class=\"navbar-brand\" href=\"#\">MyWallet Web</a>" +
	"</div>";
	
	var header2 = "<div class='navbar-header pull-right'>" + 
	"<ul class='nav navbar-nav pull-left refresh'>" +
	"<li><a href='#' id='sync' class='glyphicon glyphicon-refresh'></a></li>" +
	"</ul>" +
	"<button type=\"button\" class=\"navbar-toggle collapsed\"" + 
	"data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\"" +
	"aria-controls=\"navbar\">" + 
	"<span class=\"sr-only\">Zeige Navigation</span> <span " + 
		"class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span " +
		"class=\"icon-bar\"></span>" +
	"</button>" + 
	"</div>";

	var sync = null;
	exports.init = function () {
		var navObj = $("<nav class='navbar navbar-inverse navbar-fixed-top' role='navigation'></nav>");
		var container = $("<div class='container'></div>").appendTo(navObj);
		$(headerStr).appendTo(container);
		var h2 = $(header2).appendTo(container);
		sync = h2.find("#sync");
		sync.click(function () {
			storage.sync();
			return false;
		});
		var navbar = $("<div id='navbar' class='navbar-collapse collapse'></div>").appendTo(container);
		obj.appendTo(navbar);
		var txt = $("<p class='navbar-text navbar-right'></p>").appendTo(navbar);
		txt.text("Angemeldet als ");
		username = $("<span></span>").appendTo(txt);
		$("<span>.&nbsp;</span>").appendTo(txt);
		logout_link = $("<a href='#' class='navbar-link'>Abmelden</a>").appendTo(txt);
		logout_link.click(function () {
			app.setUser(null);
			storage.clear();
		});
		
		
		addNavPoint("Einträge", "entries");
		addNavPoint("Kategorien", "categories");
		return navObj;
	};
	
	exports.setUser = function (user) {
		username.text(user.username);
	};
	
	exports.setActive = function (id) {
		for (var key in nav_entries) {
			if(key == id) {
				nav_entries[key].addClass("active");
				nav_entries[key].find("a").blur();
			} else {
				nav_entries[key].removeClass("active");
			}
		}
		if($("#navbar").hasClass("in"))
			$("#navbar").collapse('hide');
	};
	
	exports.setUnpublished = function (unpublished) {
		if(unpublished) {
			sync.addClass("unpublished");
		} else {
			sync.removeClass("unpublished");
		}
	};
	
	function addNavPoint(name, id) {
		var li = $("<li></li>").appendTo(obj);
		var a = $("<a></a>").appendTo(li);
		a.text(name);
		a.attr("href", "#" + id);
		nav_entries[id] = li;
	}
});