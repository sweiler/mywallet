define(function (require, exports) {
	
	var storage = require("storage");
	
	var widget = $("<div/>");
	
	$("<div class='page-header'>" +
			"<h1>Kategorien</h1>" +
			"</div>").appendTo(widget);
	
	
	var categoryTable = $("<table class='table'></table>").appendTo(widget);
	var rows = [];
	
	var heading = $("<thead />").appendTo(categoryTable);
	var head_row = $("<tr/>").appendTo(heading);
	$("<th>Name:</th>").appendTo(head_row);
	$("<th>Summe der Beträge:</th>").appendTo(head_row);
	
	exports.view = function () {
		
		return widget;
		
	};
	
	exports.addCategory = function (cat) {
		var row = $("<tr/>").appendTo(categoryTable);
		rows.push(row);
		$("<td>" + cat.name + "</td>").appendTo(row);
		$("<td>" + cat.amount + "</td>").appendTo(row);
	};
	
	exports.clear = function () {
		heading.detach();
		categoryTable.empty();
		heading.prependTo(categoryTable);
	};
	
	exports.removeCategory = function (idx) {
		rows[idx].remove();
		rows = rows.slice(idx, 1);
	};
	
});