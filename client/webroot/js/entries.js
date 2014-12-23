define(function (require, exports) {
	
	var entryDialog = require("entryDialog");
	var storage = require("storage");
	
	entrytable = $("<table class='table' />");
	
	var widget = $("<div />");
	
	
	$("<div class='page-header'><h1>Einträge</h1></div>").appendTo(widget);
	
	var modalBtn = $("<button class='btn btn-default hidden-xs hidden-sm' type='button'>" +
			"<span class='glyphicon glyphicon-plus' />&nbsp;Eintrag" +
			" erstellen</button>").appendTo(widget);
	
	var pageBtn = $("<button class='btn btn-default hidden-md hidden-lg' type='button'>" +
			"<span class='glyphicon glyphicon-plus' />&nbsp;Eintrag" +
			" erstellen</button>").appendTo(widget);
	
	entrytable.appendTo(widget);
	
	
	
	modalBtn.click(entryDialog.openModal);
	pageBtn.click(entryDialog.openPage);
	
	
	
	var thead = $("<thead />").appendTo(entrytable);
	var tbody = $("<tbody />").appendTo(entrytable);
	var headlines = $("<tr/>").appendTo(thead);
	$("<th>Beschreibung:</th>").appendTo(headlines);
	$("<th>Datum:</th>").appendTo(headlines);
	$("<th>Betrag:</th>").appendTo(headlines);
	$("<th>Kategorie:</th>").appendTo(headlines);
	$("<th>&nbsp;</th>").appendTo(headlines);
	
	
	
	exports.view = function () {
		return widget;
	};
	
	exports.addEntry = function (desc, date, amount, cat) {
		var row = $("<tr />").prependTo(tbody);
		$("<td>" + desc + "</td>").appendTo(row);
		$("<td>" + date + "</td>").appendTo(row);
		var amountTxt = amount.toFixed(2).replace(".", ",") + " €";
		if(amount >= 0)
			$("<td>" + amountTxt + "</td>").appendTo(row);
		else {
			$("<td class='negative'>" + amountTxt + "</td>").appendTo(row);
			row.addClass("negative");
		}
		$("<td>" + cat + "</td>").appendTo(row);
		var buttons_td = $("<td></td>").appendTo(row);
		var remove_link = $("<a href='#'>Löschen</a>").appendTo(buttons_td);
		remove_link.click(function (e) {
			e.preventDefault();
			var idx = row.index();
			storage.removeEntry(idx);
		});
	};
	
	exports.removeEntry = function (idx) {
		tbody.children().get(idx).remove();
	};
	
	exports.clear = function () {
		tbody.empty();
	};
	
	
});