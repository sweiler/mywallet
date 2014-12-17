define(function (require, exports) {
	
	var widget = $("<div/>");
	
	$("<div class='page-header'>" +
			"<h1>Kategorien</h1>" +
			"</div>").appendTo(widget);
	
	var form = $("<form class='form-horizontal' />").appendTo(widget);
	var grp = $("<div class='form-group' />").appendTo(form);
	$("<label class='control-label col-md-2 col-xs-3' " +
			"for='cat_name'>Neue Kategorie:</label>").appendTo(grp);
	var col = $("<div class='col-md-2 col-xs-6'>").appendTo(grp);
	var name_input = $("<input type='text' class='form-control'" +
			" name='cat_name' id='cat_name' />").appendTo(col);
	
	$("<button type='submit' class='btn btn-default col-md-1" +
			" col-xs-3'>Anlegen</button>").appendTo(grp);
	
	form.submit(function () {
		var name = name_input.val();
		if(name.length > 0) {
			exports.addCategory(name);
		}
		return false;
	});
	
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
	
});