define(function (require, exports) {
	
	var entryDialog = require("entryDialog");
	
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
	var headlines = $("<tr/>").appendTo(thead);
	$("<th>Beschreibung:</th>").appendTo(headlines);
	$("<th>Datum:</th>").appendTo(headlines);
	$("<th>Betrag:</th>").appendTo(headlines);
	
	
	
	exports.view = function () {
		return widget;
	};
	
	exports.addEntry = function (desc, date, amount) {
		var row = $("<tr />").appendTo(entrytable);
		$("<td>" + desc + "</td>").appendTo(row);
		$("<td>" + date + "</td>").appendTo(row);
		$("<td>" + amount + "</td>").appendTo(row);
	};
	
	exports.addEntry("Testeintrag", "16.12.2014 16:00 Uhr", "3,00€");
	
});