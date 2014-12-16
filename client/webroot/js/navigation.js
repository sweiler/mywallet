define(function (require, exports) {
	
	var obj = $("<ul class=\"nav navbar-nav\"></ul>");
	var nav_entries = {};

	var headerStr = "<div class=\"navbar-header\">" +
		"<button type=\"button\" class=\"navbar-toggle collapsed\"" + 
			"data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\"" +
			"aria-controls=\"navbar\">" + 
			"<span class=\"sr-only\">Zeige Navigation</span> <span " + 
				"class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span " +
				"class=\"icon-bar\"></span>" +
		"</button>" + 
		"<a class=\"navbar-brand\" href=\"#\">MyWallet Web</a>" +
	"</div>";

	
	exports.init = function () {
		var navObj = $("<nav class='navbar navbar-inverse navbar-fixed-top' role='navigation'></nav>");
		var container = $("<div class='container'></div>").appendTo(navObj);
		$(headerStr).appendTo(container);
		var navbar = $("<div id='navbar' class='navbar-collapse collapse'></div>").appendTo(container);
		obj.appendTo(navbar);
		
		addNavPoint("Einträge", "entries");
		addNavPoint("Kategorien", "categories");
		return navObj;
	};
	
	exports.setActive = function (id) {
		for (var key in nav_entries) {
			if(key == id) {
				nav_entries[key].addClass("active");
			} else {
				nav_entries[key].removeClass("active");
			}
		}
		if($("#navbar").hasClass("in"))
			$("#navbar").collapse('hide');
	};
	
	function addNavPoint(name, id) {
		var li = $("<li></li>").appendTo(obj);
		var a = $("<a></a>").appendTo(li);
		a.text(name);
		a.attr("href", "#" + id);
		nav_entries[id] = li;
	}
});