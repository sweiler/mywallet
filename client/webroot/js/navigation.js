define(function (require, exports) {
	
	var obj = $("<ul class=\"nav navbar-nav\"></ul>");

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
		var header = $(headerStr).appendTo(container);
		var navbar = $("<div id='navbar' class='navbar-collapse collapse'></div>").appendTo(container);
		obj.appendTo(navbar);
		
		addNavPoint("Einträge", "#entries");
		return navObj;
	};
	
	function addNavPoint(name, href) {
		var li = $("<li></li>").appendTo(obj);
		var a = $("<a></a>").appendTo(li);
		a.text(name);
		a.attr("href", href);
	}
});