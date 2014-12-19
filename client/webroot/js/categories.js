define(function (require, exports) {
	
	var storage = require("storage");
	
	var widget = $("<div/>");
	
	$("<div class='page-header'>" +
			"<h1>Kategorien</h1>" +
			"</div>").appendTo(widget);
	
	
	var categoryTable = $("<table class='table'></table>").appendTo(widget);
	
	var heading = $("<thead />").appendTo(categoryTable);
	var head_row = $("<tr/>").appendTo(heading);
	$("<th>Name:</th>").appendTo(head_row);
	
	exports.view = function () {
		
		return widget;
		
	};
	
	exports.addCategory = function (name) {
		var row = $("<tr/>").appendTo(categoryTable);
		$("<td>" + name + "</td>").appendTo(row);
	};
	
	exports.clear = function () {
		heading.detach();
		categoryTable.empty();
		heading.prependTo(categoryTable);
	};
	
	
	
});